import { useMemo } from "react";
import useAuth from "./useAuth";

export default function useUser() {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const displayName = useMemo(() => {
    if (!user?.name) return "User";
    return user.name;
  }, [user]);

  return {
    user,
    displayName,
    isAuthenticated,
    isAdmin
  };
}
