import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import api from "../api/axios";

export const AuthContext = createContext(null);

const TOKEN_KEY = "pneumo_token";
const USER_KEY = "pneumo_user";

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? safeParse(stored) : null;
  });
  const [bootstrapping, setBootstrapping] = useState(true);

  const persistAuth = useCallback((authToken, userData) => {
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setBootstrapping(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      });

      if (data?.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setToken(storedToken);
        setUser(data.user);
      }
    } catch {
      clearAuth();
    } finally {
      setBootstrapping(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback((authToken, userData) => {
    persistAuth(authToken, userData);
  }, [persistAuth]);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const updateUser = useCallback((userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const value = useMemo(() => {
    const isAuthenticated = Boolean(token && user);
    const isAdmin = user?.role === "admin";

    return {
      token,
      user,
      isAuthenticated,
      isAdmin,
      bootstrapping,
      login,
      logout,
      updateUser,
      refreshMe
    };
  }, [token, user, bootstrapping, login, logout, updateUser, refreshMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
