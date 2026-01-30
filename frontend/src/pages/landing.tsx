import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Calendar,
  FolderOpen,
  Zap,
  Smartphone,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loginlogo } from "../assets/images";

// ============= INTERFACES =============

interface DecodedToken {
  useremail: string;
  userrole: string;
  userid: number;
}

interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

interface SignupResponse {
  message: string;
  userid: number;
  assigned_id: number;
  id_type: string;
  useremail: string;
  userrole: string;
}

// ============= MAIN COMPONENT =============

const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const navigate = useNavigate();

  // Login state
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Signup state
  const [signupData, setSignupData] = useState<SignupForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState<SignupResponse | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);

  const features = [
    {
      icon: BookOpen,
      title: "Course Management",
      description: "Organize and manage courses with ease",
    },
    {
      icon: CheckSquare,
      title: "Assignments & Quizzes",
      description: "Create, distribute, and grade assessments",
    },
    {
      icon: MessageSquare,
      title: "Discussion Forums",
      description: "Foster collaboration and engagement",
    },
    {
      icon: BarChart3,
      title: "Grade Tracking",
      description: "Monitor student progress and performance",
    },
    {
      icon: Calendar,
      title: "Calendar Integration",
      description: "Stay organized with integrated scheduling",
    },
    {
      icon: FolderOpen,
      title: "File Sharing",
      description: "Securely share and manage course materials",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Instant notifications and collaboration",
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Access anywhere, on any device",
    },
  ];

  // ============= LOGIN HANDLERS =============

  const handleLogin = async () => {
    try {
      const requestBody = new URLSearchParams();
      requestBody.append("grant_type", "password");
      requestBody.append("username", loginData.username);
      requestBody.append("password", loginData.password);
      requestBody.append("scope", "");
      requestBody.append("client_id", "string");
      requestBody.append("client_secret", "string");

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const response = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: requestBody,
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;
        const payload: DecodedToken = jwtDecode(newToken);
        localStorage.setItem("token", newToken);
        const userRole = payload.userrole;
        localStorage.setItem("role", userRole);

        if (userRole === "Faculty") {
          navigate("/faculty_dashboard");
        } else if (userRole === "Student") {
          navigate("/dashboard");
        } else if (userRole === "Admin") {
          navigate("/admin_dashboard");
        } else {
          setLoginError("Unknown user role");
        }
      } else {
        const errorData = await response.json();
        setLoginError(errorData.detail || "An error occurred during login.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setLoginError("An error occurred during login. Please try again later.");
    }
  };

  // ============= SIGNUP HANDLERS =============

  const validateSignupForm = (): boolean => {
    if (!signupData.firstName.trim()) {
      setSignupError("First name is required");
      return false;
    }
    if (!signupData.lastName.trim()) {
      setSignupError("Last name is required");
      return false;
    }
    if (!signupData.email.trim()) {
      setSignupError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      setSignupError("Please enter a valid email address");
      return false;
    }
    if (!signupData.password) {
      setSignupError("Password is required");
      return false;
    }
    if (signupData.password.length < 8) {
      setSignupError("Password must be at least 8 characters long");
      return false;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setSignupError("Passwords do not match");
      return false;
    }
    // Role is no longer validated - defaults to "Student"
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignupForm()) {
      return;
    }

    setSignupLoading(true);
    setSignupError("");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Userfirstname: signupData.firstName,
          Userlastname: signupData.lastName,
          Useremail: signupData.email,
          Userpassword: signupData.password,
          Userrole: "Student", // All new users are Students by default
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSignupSuccess(data);
      } else {
        setSignupError(data.detail || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setSignupError("An error occurred during signup. Please try again later.");
    } finally {
      setSignupLoading(false);
    }
  };

  const switchToLoginAfterSignup = () => {
    setSignupSuccess(null);
    setSignupData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    });
    setActiveTab("login");
  };

  return (
    <>
      <Helmet>
        <title>Go-Canvas | Modern LMS</title>
      </Helmet>

      <div className="min-h-screen flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden relative">
        {/* Mobile Login Button - Scrolls to Form */}
        <div className="absolute top-4 right-4 z-50 lg:hidden">
          <Button 
            className="bg-white text-green-600 border border-green-200 shadow-md hover:bg-green-50"
            onClick={() => {
              document.getElementById('auth-forms')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Login
          </Button>
        </div>

        {/* ============= LEFT SIDE - FEATURES ============= */}
        <div className="w-full lg:w-3/5 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 pt-12 lg:p-12 lg:pt-24 flex flex-col justify-start lg:overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {/* Logo and Header - Centered */}
            <div className="mb-8 text-center">
              <img src={loginlogo} alt="Go-Canvas" className="h-16 w-auto mb-4 mx-auto" />
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Go-Canvas
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed max-w-xl mx-auto">
                A modern Learning Management System that empowers educators and
                engages students with powerful tools for online and hybrid learning.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============= RIGHT SIDE - AUTH FORMS ============= */}
        <div id="auth-forms" className="w-full lg:w-2/5 bg-white p-6 pt-12 lg:p-12 lg:pt-24 flex items-start justify-center lg:overflow-y-auto">
          <div className="w-full max-w-md min-h-[500px] lg:min-h-[600px] flex flex-col justify-start">
            {/* Tab Switcher */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${
                  activeTab === "login"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${
                  activeTab === "signup"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Login Form */}
            {activeTab === "login" && (
              <div className="h-auto lg:h-[520px] space-y-5 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Welcome Back!
                  </h2>
                  <p className="text-gray-600">
                    Please log in to continue
                  </p>
                </div>

                {loginError && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                    {loginError}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="username">Email or ID</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your email or Student/Faculty ID"
                      value={loginData.username}
                      onChange={(e) =>
                        setLoginData({ ...loginData, username: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Keep me signed in
                    </Label>
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 cursor-pointer">
                    Login
                  </Button>

                  <div className="text-center">
                    <a href="#" className="text-sm text-green-600 hover:underline">
                      Forgot your password?
                    </a>
                  </div>
                </form>
              </div>
            )}

            {/* Signup Form */}
            {activeTab === "signup" && (
              <div className="h-auto lg:h-[520px] space-y-5 animate-in fade-in duration-300 lg:overflow-y-auto px-1">
                {signupSuccess ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded-md">
                      <p className="font-semibold mb-2">
                        ✓ {signupSuccess.message}
                      </p>
                      <p className="mb-1">
                        Your <strong>{signupSuccess.id_type}</strong> is:{" "}
                        <strong className="text-lg">{signupSuccess.assigned_id}</strong>
                      </p>
                      <p className="text-xs mt-2 text-green-700">
                        Please save this ID. You can use it to login along with
                        your email.
                      </p>
                    </div>

                    <Button
                      onClick={switchToLoginAfterSignup}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Go to Login
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Create Account
                      </h2>
                      <p className="text-gray-600">Join Go-Canvas today</p>
                    </div>

                    {signupError && (
                      <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                        {signupError}
                      </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="John"
                            value={signupData.firstName}
                            onChange={(e) =>
                              setSignupData({
                                ...signupData,
                                firstName: e.target.value,
                              })
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            placeholder="Doe"
                            value={signupData.lastName}
                            onChange={(e) =>
                              setSignupData({
                                ...signupData,
                                lastName: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john.doe@example.com"
                          value={signupData.email}
                          onChange={(e) =>
                            setSignupData({ ...signupData, email: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Minimum 8 characters"
                          value={signupData.password}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Re-enter your password"
                          value={signupData.confirmPassword}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 cursor-pointer"
                        disabled={signupLoading}
                      >
                        {signupLoading ? "Creating Account..." : "Sign Up"}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
