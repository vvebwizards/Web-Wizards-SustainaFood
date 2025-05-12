import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PublicRouteProps {
  children: JSX.Element;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    // If the user is logged in, redirect to the dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;