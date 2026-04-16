import { useCallback, useMemo, useState } from "react";

const TOKEN_KEY = "pneumo_token";
const USER_KEY = "pneumo_user";

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export default function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? safeParse(stored) : null;
  });

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);
  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  const login = useCallback((authToken, userData) => {
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    updateUser
  };
}
