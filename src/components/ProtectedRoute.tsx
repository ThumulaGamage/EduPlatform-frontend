// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user's role is allowed
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on user's actual role
    if (user.role === "student") {
      return <Navigate to="/student-dashboard" replace />;
    } else if (user.role === "teacher") {
      return <Navigate to="/teacher-dashboard" replace />;
    } else if (user.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;