import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface GooglePasswordSetupProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: number;
  assignedId: string;
  googleCredential: string;
}

interface DecodedToken {
  useremail: string;
  userrole: string;
  userid: number;
}

export function GooglePasswordSetup({
  isOpen,
  onClose,
  userEmail,
  userId,
  assignedId,
  googleCredential,
}: GooglePasswordSetupProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");

    // Validation
    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_URL}/auth/google/set-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          credential: googleCredential,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;
        const payload: DecodedToken = jwtDecode(newToken);

        // Store token
        localStorage.setItem("token", newToken);
        localStorage.setItem("role", payload.userrole);

        // Close modal
        onClose();

        // Redirect based on role
        if (payload.userrole === "Faculty") {
          navigate("/faculty_dashboard");
        } else if (payload.userrole === "Student") {
          navigate("/dashboard");
        } else if (payload.userrole === "Admin") {
          navigate("/admin_dashboard");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to set password. Please try again.");
      }
    } catch (error) {
      console.error("Error setting password:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome! Complete Your Account Setup</DialogTitle>
          <DialogDescription>
            Create a password to access your account using your Student ID
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Your Student ID</AlertTitle>
            <AlertDescription>
              Your unique ID is: <strong className="text-lg">{assignedId}</strong>
              <br />
              Internal User ID: <strong>{userId}</strong>
              <br />
              <span className="text-xs text-muted-foreground mt-1 block">
                Save this ID - you can use it to login with your password in the future
              </span>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={userEmail} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Create Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Setting up..." : "Complete Setup"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Next time you can login with either Google or your ID + password
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
