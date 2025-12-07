// src/components/RoleRedirect.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// This component redirects users to their appropriate dashboard after login
const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case "student":
          navigate("/student-dashboard", { replace: true });
          break;
        case "teacher":
          navigate("/teacher-dashboard", { replace: true });
          break;
        case "admin":
          navigate("/admin-dashboard", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return null;
};

export default RoleRedirect;