import { Navigate } from "react-router-dom";
import { useAuthStore } from "../features/auth/store";
import { JSX } from "react";

export function ProtectedRoute({
  children,
}: Readonly<{ children: JSX.Element }>) {
  const { token, forcePasswordChange } = useAuthStore();

  if (!token) return <Navigate to="/" replace />;
  if (forcePasswordChange) return <Navigate to="/update-admin" replace />;

  return children;
}
