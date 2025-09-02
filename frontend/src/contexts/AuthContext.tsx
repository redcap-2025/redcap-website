// Update your imports for best practice
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "../types/user";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, "id" | "createdAt">) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>; 
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = "http://localhost:8000/api"; // backend API

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });
  const [error, setError] = useState<string | null>(null);

  /** 🔐 Helpers */
  const getAuthHeaders = () => {
    const token = localStorage.getItem("redcap_token");
    if (!token) throw new Error("No token found. Please log in again.");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...getAuthHeaders(),
      },
    });

    if (res.status === 401) {
      logout();  // Log the user out if session expired
      throw new Error("Session expired. Please log in again.");
    }

    return res;
  };

  /** 🔄 Init state from localStorage */
  useEffect(() => {
    const storedUser = localStorage.getItem("redcap_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        setAuthState({ isAuthenticated: true, user, loading: false });
      } catch {
        localStorage.removeItem("redcap_user");
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const clearError = () => setError(null);

  /** 🔑 LOGIN */
  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Invalid credentials");

      localStorage.setItem("redcap_token", data.token);
      localStorage.setItem("redcap_user", JSON.stringify(data.user));

      setAuthState({ isAuthenticated: true, user: data.user as User, loading: false });
    } catch (err: any) {
      setError(err.message);
      setAuthState((prev) => ({ ...prev, loading: false }));
      throw err;
    }
  };

  /** 📝 REGISTER */
  const register = async (userData: Omit<User, "id" | "createdAt">): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Registration failed");

      localStorage.setItem("redcap_token", data.token);
      localStorage.setItem("redcap_user", JSON.stringify(data.user));

      setAuthState({ isAuthenticated: true, user: data.user as User, loading: false });
    } catch (err: any) {
      setError(err.message);
      setAuthState((prev) => ({ ...prev, loading: false }));
      throw err;
    }
  };

  /** 🚪 LOGOUT */
  const logout = () => {
    localStorage.removeItem("redcap_user");
    localStorage.removeItem("redcap_token");
    setAuthState({ isAuthenticated: false, user: null, loading: false });
  };

  /** 👤 UPDATE PROFILE */
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    if (!authState.user) return;
    setAuthState((prev) => ({ ...prev, loading: true }));
    setError(null);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/profile`, {
        method: "PUT",
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Update failed");

      const updatedUser: User = { ...authState.user, ...data.user };
      localStorage.setItem("redcap_user", JSON.stringify(updatedUser));
      setAuthState({ isAuthenticated: true, user: updatedUser, loading: false });
    } catch (err: any) {
      setError(err.message);
      setAuthState((prev) => ({ ...prev, loading: false }));
      throw err;
    }
  };

  /** 🔄 FETCH PROFILE */
  const fetchProfile = async (): Promise<void> => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/profile`, { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch profile");

      const mergedUser: User = { ...authState.user!, ...data };
      localStorage.setItem("redcap_user", JSON.stringify(mergedUser));
      setAuthState({ isAuthenticated: true, user: mergedUser, loading: false });
    } catch (err: any) {
      setError(err.message);
    }
  };

  /** 📧 FORGOT PASSWORD */
  const forgotPassword = async (email: string): Promise<void> => {
    setError(null);
    const res = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setError(data.message || "Failed to send reset email");
      throw new Error(data.message || "Failed to send reset email");
    }
  };

 // In the resetPassword function, update to match the new API:
const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  setError(null);
  
  // Get email from URL or state if needed
  const email = ""; // You'll need to pass this from the reset page
  
  const res = await fetch(`${API_BASE_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, email, password: newPassword }),
  });
  
  const data = await res.json();
  if (!res.ok || !data.success) {
    setError(data.message || "Failed to reset password");
    throw new Error(data.message || "Failed to reset password");
  }
};

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateProfile,
        fetchProfile,
        fetchWithAuth,
        forgotPassword,
        resetPassword,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
