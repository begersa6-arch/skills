import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "job_seeker" | "employer";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user needs to complete profile setup
  if (profile?.role === "job_seeker") {
    // Allow access to profile setup page
    if (location.pathname !== "/profile/setup") {
      // Check if seeker profile exists - we'll redirect from the discover page if not
    }
  }

  if (profile?.role === "employer") {
    if (location.pathname !== "/employer/setup") {
      // Check if company profile exists - we'll redirect from dashboard if not
    }
  }

  // Check role-based access
  if (requiredRole && profile?.role !== requiredRole) {
    if (profile?.role === "employer") {
      return <Navigate to="/employer/dashboard" replace />;
    }
    return <Navigate to="/discover" replace />;
  }

  return <>{children}</>;
}
