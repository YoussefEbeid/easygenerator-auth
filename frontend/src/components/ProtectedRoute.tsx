import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";

export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <div className="splash" aria-busy="true" />;
  if (status === "anonymous") {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
