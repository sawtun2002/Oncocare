import { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentUser, login as apiLogin, signup as apiSignup } from "../api/auth";

const TOKEN_KEY = "cancer-hms-token";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetchCurrentUser(token)
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { token, user } = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  }

  // Signup logs the account in immediately -- same token/user handling as
  // login(), since the API returns the same shape.
  async function signup(input) {
    const { token, user } = await apiSignup(input);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
