import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "../types/user";
import { apiService } from "../services/api"; // ✅ CORRECTED IMPORT PATH

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, "id" | "createdAt">) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
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

  /** 🔐 Reuse ApiService for authenticated requests */
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${localStorage.getItem("redcap_token")}`,
      },
    });

    if (res.status === 401) {
      logout();
      throw new Error("Session expired. Please log in again.");
    }

    return res;
  };

  /** 🔄 Restore session from localStorage */
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

  /** 🔑 LOGIN */
  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    setError(null);
    try {
      const response = await apiService.login(email, password);
      if (!response.success || !response.user || !response.token) {
        // ✅ FIXED: Check both error and message fields
        throw new Error(response.error || response.message || "Login failed");
      }
      setAuthState({ isAuthenticated: true, user: response.user, loading: false });
    } catch (err: any) {
      // ✅ FIXED: Show specific error message
      const errorMessage = err.message.includes("Invalid email or password")
        ? "Invalid email or password. Please try again."
        : err.message;
        
      setError(errorMessage);
      setAuthState((prev) => ({ ...prev, loading: false }));
      throw err;
    }
  };

  /** 📝 REGISTER */
  const register = async (userData: Omit<User, "id" | "createdAt">) => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    setError(null);

    // ✅ Ensure password is defined (fixes TypeScript error)
    if (!userData.email || !userData.password || !userData.fullName || !userData.phone) {
      setError("All fields are required");
      setAuthState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const response = await apiService.register({
        ...userData,
        password: userData.password // TypeScript now knows it's defined
      });
      
      if (!response.success || !response.user || !response.token) {
        // ✅ FIXED: Check both error and message fields
        throw new Error(response.error || response.message || "Registration failed");
      }
      setAuthState({ isAuthenticated: true, user: response.user, loading: false });
    } catch (err: any) {
      console.error("❌ Registration error:", err.message);
      const errorMessage = err.message.includes("Email already registered")
        ? "This email is already registered. Please try logging in."
        : err.message || "Something went wrong. Please try again.";
        
      setError(errorMessage);
      setAuthState((prev) => ({ ...prev, loading: false }));
      throw err; // Added for consistency with login
    }
  };

  /** 🚪 LOGOUT */
  const logout = () => {
    apiService.logout();
    setAuthState({ isAuthenticated: false, user: null, loading: false });
  };

  /** 👤 UPDATE PROFILE */
  const updateProfile = async (userData: Partial<User>) => {
    if (!authState.user) return;
    setAuthState((prev) => ({ ...prev, loading: true }));
    setError(null);
    
    try {
      // ✅ Filter out undefined values (fixes TypeScript error)
      const filteredUserData = Object.fromEntries(
        Object.entries(userData).filter(([_, value]) => value !== undefined)
      ) as Partial<User>;
      
      const response = await apiService.updateProfile(filteredUserData) as { success: boolean; user?: any; error?: string; message?: string };
      if (!response.success) {
        throw new Error(response.error || response.message || "Profile update failed");
      }
      if (!response.user) {
        throw new Error("Updated user data not received");
      }
      const updatedUser = { ...authState.user, ...response.user };
      localStorage.setItem("redcap_user", JSON.stringify(updatedUser));
      setAuthState({ isAuthenticated: true, user: updatedUser, loading: false });
    } catch (err: any) {
      setError(err.message);
      setAuthState((prev) => ({ ...prev, loading: false }));
      throw err;
    }
  };

  /** 🔄 FETCH PROFILE */
  const fetchProfile = async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    setError(null);
    try {
      const response = await apiService.getProfile() as { success: boolean; user?: any; error?: string; message?: string };
      if (!response.success) {
        throw new Error(response.error || response.message || "Failed to fetch profile");
      }
      if (!response.user) {
        throw new Error("User data not received");
      }
      const mergedUser = { ...authState.user, ...response.user } as User;
      localStorage.setItem("redcap_user", JSON.stringify(mergedUser));
      setAuthState({ isAuthenticated: true, user: mergedUser, loading: false });
    } catch (err: any) {
      setError(err.message);
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  };

  /** 📧 FORGOT PASSWORD */
  const forgotPassword = async (email: string) => {
    setError(null);
    try {
      await apiService.forgotPassword(email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  /** 🔐 RESET PASSWORD */
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

/** 🔍 Custom hook for using auth anywhere */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
