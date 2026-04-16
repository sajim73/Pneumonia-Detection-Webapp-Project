import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

export default function useAdminGuard() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, bootstrapping } = useAuth();

  useEffect(() => {
    if (bootstrapping) return;

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isAdmin) {
      navigate("/dashboard", { replace: true });
    }
  }, [bootstrapping, isAuthenticated, isAdmin, navigate]);

  return {
    isAuthenticated,
    isAdmin,
    bootstrapping
  };
}
