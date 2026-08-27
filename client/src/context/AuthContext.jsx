import { createContext, useContext, useEffect, useState } from "react";
import { 
  fetchCurrentUser, 
  login as apiLogin, 
  signup as apiSignup,
  updateProfile as apiUpdateProfile,
  changePassword as apiChangePassword
} from "../api/auth";

const TOKEN_KEY = "cancer-hms-token";
const PROFILE_KEY = "cancer-hms-profile-overrides";

const AuthContext = createContext(undefined);

function withProfileOverrides(account) {
  if (!account?.id) return account;
  const raw = localStorage.getItem(PROFILE_KEY);
  try {
    const overrides = raw ? JSON.parse(raw)[account.id] : undefined;
    return overrides ? { ...account, ...overrides } : account;
  } catch {
    return account;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    
    fetchCurrentUser(token)
      .then((account) => {
        if (isMounted) {
          setUser(withProfileOverrides(account));
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
      
    return () => {
      isMounted = false;
    };
  }, [token]);

  async function login(email, password) {
    const response = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(withProfileOverrides(response.user));
  }

  async function signup(input) {
    const response = await apiSignup(input);
    localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(withProfileOverrides(response.user));
  }

  async function updateProfile(input) {
    if (!user) throw new Error("You must be signed in to update your profile.");
    
    // Try API first
    if (token) {
      const updatedUser = await apiUpdateProfile(token, input);
      setUser(withProfileOverrides(updatedUser));
      return updatedUser;
    }
    
    // Fallback to local storage (shouldn't happen in production)
    const profiles = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    profiles[user.id] = { name: input.name, email: input.email };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
    setUser((current) => ({ ...current, ...profiles[user.id] }));
    return user;
  }

  async function changePassword(currentPassword, newPassword) {
    if (!user) throw new Error("You must be signed in to change your password.");
    if (!token) throw new Error("No valid session found.");
    
    await apiChangePassword(token, currentPassword, newPassword);
    return true;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      token,
      login, 
      signup, 
      updateProfile, 
      changePassword,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}