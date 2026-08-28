import { createContext, useContext, useEffect, useState } from "react";
import {
  changePassword as apiChangePassword,
  fetchCurrentUser,
  login as apiLogin,
  markNotificationsRead as apiMarkNotificationsRead,
  signup as apiSignup,
  updateAvatar as apiUpdateAvatar,
  updateNotificationPreferences as apiUpdateNotificationPreferences,
  updateProfile as apiUpdateProfile,
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

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  /**
   * Own-account edits go through here rather than straight from the page, for
   * the same reason login() does: the session token lives in this module, and
   * the sidebar's name and initials have to follow the change immediately.
   */
  async function updateProfile(input) {
    const updated = await apiUpdateProfile(localStorage.getItem(TOKEN_KEY), input);
    setUser(updated);
  }

  // The token is unchanged by a password change -- this is not a re-login, and
  // there is nothing to store.
  async function changePassword(input) {
    await apiChangePassword(localStorage.getItem(TOKEN_KEY), input);
  }

  // Photo and notification preferences are separate from updateProfile() on
  // purpose -- each is meant to save the instant it changes (a file picked, a
  // toggle flipped), not wait on the details form's own Save button.
  async function updateAvatar(avatarUrl) {
    const updated = await apiUpdateAvatar(localStorage.getItem(TOKEN_KEY), avatarUrl);
    setUser(updated);
  }

  async function updateNotificationPreferences(input) {
    const updated = await apiUpdateNotificationPreferences(localStorage.getItem(TOKEN_KEY), input);
    setUser(updated);
  }

  // Clears the notice bell. Like the two above it goes through here rather than
  // straight from NoticeBell, so the sidebar's unread badge updates at once.
  async function markNotificationsRead() {
    const updated = await apiMarkNotificationsRead(localStorage.getItem(TOKEN_KEY));
    setUser(updated);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        updateAvatar,
        updateNotificationPreferences,
        markNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}