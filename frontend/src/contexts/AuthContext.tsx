// contexts/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, RegisterUserData, UpdateUserData, AuthState } from "../types/user";
import { apiService } from "../services/api";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterUserData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: UpdateUserData) => Promise<User>;
  fetchProfile: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string, email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });
  const [error, setError] = useState<string | null>(null);

  const logout = () => {
    apiService.logout();
    setAuthState({ isAuthenticated: false, user: null, loading: false });
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("redcap_token");
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (res.status === 401) {
      logout();
      throw new Error("Session expired. Please log in again.");
    }

    return res;
  };

  // Restore session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("redcap_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        setAuthState({ isAuthenticated: true, user, loading: false });
      } catch (err) {
        console.error("Failed to parse stored user", err);
        localStorage.removeItem("redcap_user");
        localStorage.removeItem("redcap_token");
      }
    } else {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const clearError = () => setError(null);

  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    setError(null);
    try {
      const response = await apiService.login(email, password);
      if (!response.success || !response.user || !response.token) {
        throw new Error(response.error || response.message || "Login failed");
      }
      setAuthState({ isAuthenticated: true, user: response.user, loading: false });
    } catch (err: any) {
      const errorMessage = err.message.includes("Invalid email or password")
        ? "Invalid email or password. Please try again."
        : err.message;
      setError(errorMessage);
      setAuthState((prev) => ({ ...prev, loading: false }));
      throw err;
    }
  };

  // ✅ Fixed: Use RegisterUserData here too
  const register = async (userData: RegisterUserData) => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    setError(null);

    if (!userData.email || !userData.password || !userData.fullName || !userData.phone) {
      setError("All fields are required");
      setAuthState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const response = await apiService.register(userData);
      if (!response.success || !response.user || !response.token) {
        throw new Error(response.error || response.message || "Registration failed");
      }
      setAuthState({ isAuthenticated: true, user: response.user, loading: false });
    } catch (err: any) {
      const errorMessage = err.message.includes("Email already registered")
        ? "This email is already registered. Please try logging in."
        : err.message || "Something went wrong. Please try again.";
      setError(errorMessage);
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  };

  const updateProfile = async (userData: UpdateUserData): Promise<User> => {
    if (!authState.user) throw new Error("Not authenticated");

    setAuthState((prev) => ({ ...prev, loading: true }));
    setError(null);

    try {
      const result = await apiService.updateProfile(userData);
      const updatedUser = { ...authState.user, ...result.user };

      localStorage.setItem("redcap_user", JSON.stringify(updatedUser));
      setAuthState({ isAuthenticated: true, user: updatedUser, loading: false });

      return updatedUser;
    } catch (err: any) {
      setError(err.message);
      setAuthState((prev) => ({ ...prev, loading: false }));
      throw err;
    }
  };

  const fetchProfile = async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    setError(null);
    try {
      const data = await apiService.getProfile();
      const mergedUser = { ...authState.user, ...data.user } as User;
      localStorage.setItem("redcap_user", JSON.stringify(mergedUser));
      setAuthState({ isAuthenticated: true, user: mergedUser, loading: false });
    } catch (err: any) {
      setError(err.message);
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  };

  const forgotPassword = async (email: string) => {
    setError(null);
    try {
      await apiService.forgotPassword(email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (token: string, newPassword: string, email: string) => {
    setError(null);
    try {
      await apiService.resetPassword(token, email, newPassword);
    } catch (err: any) {
      setError(err.message);
      throw err;
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};