import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";

export default function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === "loading") return <div className="splash" aria-busy="true" />;
  if (status === "authenticated") return <Navigate to="/" replace />;
  return <Outlet />;
}
