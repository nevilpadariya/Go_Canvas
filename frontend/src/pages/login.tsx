import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [token, setToken] = useState<string | null>(null);
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

  return (
    <>
      <Helmet>
        <title>Login | Go-Canvas</title>
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
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
