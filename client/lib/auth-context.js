"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, setToken } from "./api";

const USER_KEY = "queueskip_user";
const AuthContext = createContext(null);

function readSavedUser() {
  try {
    return JSON.parse(window.localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

function saveUser(user) {
  try {
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(USER_KEY);
  } catch {}
}

// Where each kind of user lands after signing in.
export function homeFor(user) {
  return user.role === "admin" ? "/admin" : "/dashboard";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      // Not signed in: nothing to check with the server.
      setLoading(false);
      return;
    }

    // Show the saved user straight away so a refresh never bounces to /login,
    // then confirm with the server in the background.
    const saved = readSavedUser();
    if (saved) {
      setUser(saved);
      setLoading(false);
    }

    api
      .me()
      .then(({ user }) => {
        saveUser(user);
        setUser(user);
      })
      .catch((err) => {
        // Sign out only when the server rejects the token. A slow or
        // unreachable server must not log people out.
        const rejected = err.status === 401 || err.status === 404;
        if (rejected && getToken() === token) {
          setToken(null);
          saveUser(null);
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(payload) {
    const { token, user } = await api.login(payload);
    setToken(token);
    saveUser(user);
    setUser(user);
  }

  async function register(payload) {
    const { token, user } = await api.register(payload);
    setToken(token);
    saveUser(user);
    setUser(user);
  }

  function logout() {
    setToken(null);
    saveUser(null);
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// For pages that need a signed-in user (pass "admin" for admin-only pages).
// Returns the user when allowed, otherwise null while redirecting.
export function useRequireAuth(role) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const allowed = user && (!role || user.role === role) ? user : null;

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!allowed) router.replace("/dashboard");
  }, [loading, user, allowed, router]);

  return allowed;
}

// For the login / register pages: signed-in users are sent on to their home.
export function useRedirectIfSignedIn() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace(homeFor(user));
  }, [loading, user, router]);
}
