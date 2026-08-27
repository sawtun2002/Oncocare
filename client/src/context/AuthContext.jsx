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
