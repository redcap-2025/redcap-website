// services/apiService.ts

// 🔧 Use relative path or environment variable
const API_BASE_URL =
  import.meta.env?.PROD
    ? "https://redcap-website.onrender.com"  // ✅ Updated to your Render URL
    : "http://localhost:8000";

// Optional: Use environment variable if using build-time injection
// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiService {
  private token: string | null = null;

  constructor() {
    // Get token from localStorage on initialization
    this.token = localStorage.getItem("redcap_token");
  }

  /**
   * Generic request handler with auth & JSON support
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: T & { success?: boolean; error?: string } = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || response.statusText || "Request failed";
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // 🔹 REGISTER + Auto-login
  async register(userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    doorNumber: string;
    buildingName?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  }) {
    const response = await this.request<{
      success: boolean;
      user: any;
      token: string;
      error?: string;
    }>("/api/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success && response.token) {
      this.setAuth(response.token, response.user);
    }

    return response;
  }

  // 🔹 LOGIN
  async login(email: string, password: string) {
    const response = await this.request<{
      success: boolean;
      user: any;
      token: string;
      error?: string;
    }>("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      this.setAuth(response.token, response.user);
    }

    return response;
  }

  // 🔹 PROFILE: Get & Update
  async getProfile() {
    return await this.request<any>("/api/profile");
  }

  async updateProfile(userData: {
    fullName: string;
    phone: string;
    doorNumber: string;
    buildingName?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  }) {
    return await this.request<any>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  // 🔹 BOOKINGS
  async createBooking(bookingData: any) {
    return await this.request<any>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async getUserBookings() {
    return await this.request<{ success: boolean; bookings: any[] }>("/api/bookings");
  }

  // 🔹 HEALTH CHECK
  async healthCheck() {
    return await this.request<{ success: boolean; message: string; timestamp: string }>("/health");
  }

  // 🔹 AUTH HELPERS
  private setAuth(token: string, user: any) {
    this.token = token;
    localStorage.setItem("redcap_token", token);
    localStorage.setItem("redcap_user", JSON.stringify(user));
  }

  logout() {
    this.token = null;
    localStorage.removeItem("redcap_token");
    localStorage.removeItem("redcap_user");
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Optional: Refresh user from localStorage
  getStoredUser() {
    const userStr = localStorage.getItem("redcap_user");
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const apiService = new ApiService();
export default apiService;