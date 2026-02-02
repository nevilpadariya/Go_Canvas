import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { loginlogo } from "../assets/images";

interface User {
  username: string;
  password: string;
}

interface DecodedToken {
  useremail: string;
  userrole: string;
  userid: number;
}

const Login: React.FC = () => {
  const [user, setUser] = useState<User>({ username: "", password: "" });
  const [error, setError] = useState<string>("");
  const [, setToken] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const requestBody = new URLSearchParams();
      requestBody.append("grant_type", "password");
      requestBody.append("username", user.username);
      requestBody.append("password", user.password);
      requestBody.append("scope", "");
      requestBody.append("client_id", "string");
      requestBody.append("client_secret", "string");

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      const response = await fetch(
        `${API_URL}/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: requestBody,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;
        const payload: DecodedToken = jwtDecode(newToken);
        localStorage.setItem("token", newToken);
        setToken(newToken);
        const userRole = payload.userrole;
        localStorage.setItem("role", userRole);
        
        if (userRole === "Faculty") {
          navigate("/faculty_dashboard");
        } else if (userRole === "Student") {
          navigate("/dashboard");
        } else if (userRole === "Admin") {
          navigate("/admin_dashboard");
        } else {
          setError("Unknown user role");
        }
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.detail || "An error occurred during login.";
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred during login. Please try again later.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      const response = await fetch(
        `${API_URL}/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;
        const payload: DecodedToken = jwtDecode(newToken);
        localStorage.setItem("token", newToken);
        setToken(newToken);
        const userRole = payload.userrole;
        localStorage.setItem("role", userRole);
        
        if (userRole === "Faculty") {
          navigate("/faculty_dashboard");
        } else if (userRole === "Student") {
          navigate("/dashboard");
        } else if (userRole === "Admin") {
          navigate("/admin_dashboard");
        } else {
          setError("Unknown user role");
        }
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.detail || "An error occurred during Google login.";
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      setError("An error occurred during Google login. Please try again later.");
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <>
      <Helmet>
        <title>Login | Go-Canvas</title>
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          {/* DEBUG: Button should appear below Login */}
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <img src={loginlogo} alt="Go-Canvas" className="h-16 w-auto mx-auto" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
            <p className="text-muted-foreground">Please log in to continue</p>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
                {error}
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
                  value={user.username}
                  onChange={handleInputChange}
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
                  value={user.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Keep me signed in
                </Label>
              </div>
              
              <Button type="submit" className="w-full">
                Login
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-md font-medium transition-all shadow-sm hover:shadow-md w-full"
                  onClick={() => setError("Google Sign-In coming soon!")}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
              
              <div className="text-center space-y-2">
                <a href="#" className="block text-sm text-primary hover:underline">
                  Forgot your password?
                </a>
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <a href="/signup" className="text-primary hover:underline font-medium">
                    Sign up
                  </a>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Login;
