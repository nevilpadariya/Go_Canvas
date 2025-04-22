import React from "react";
import { Navigate, RouteProps } from "react-router-dom";

interface ProtectedRouteProps extends Omit<RouteProps, "element"> {
  role: string;
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  role,
  children,
  ...rest
}) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role === "admin" && userRole !== "Admin") {
    return <Navigate to="/error" />;
  }

  if (role === "student" && userRole !== "Student") {
    return <Navigate to="/error" />;
  }

  if (role === "faculty" && userRole !== "Faculty") {
    return <Navigate to="/error" />;
  }

  console.log("failing all");

  return children;
};

export default ProtectedRoute;