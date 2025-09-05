// services/api.ts

// ✅ Use environment variable (recommended) with fallback & trailing slash fix
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("redcap_token");
  }

  /**
   * Generic request handler with auth & JSON support
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

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

      // ✅ Guard against HTML responses (e.g., 404 page, 500 error)
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        console.error("❌ Non-JSON response received:", text);
        throw new Error(
          "Server returned an invalid response. Check your internet connection and API URL."
        );
      }

      const data = (await response.json()) as T & {
        success?: boolean;
        error?: string;
        message?: string;
      };

      // ✅ Handle API-level errors (400, 401, 500 with JSON body)
      if (!response.ok) {
        if (response.status === 401) {
          this.logout(); // clear token if unauthorized
          throw new Error("Session expired. Please log in again.");
        }

        const errorMsg =
          data?.error ||
          data?.message ||
          (response.status === 404
            ? "Endpoint not found. Check API route structure."
            : response.statusText) ||
          "Request failed";

        throw new Error(errorMsg);
      }

      return data;
    } catch (error: any) {
      // ✅ Improve user-friendly error messages
      if (error.message.includes("Failed to fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your internet or try again later."
        );
      }
      if (error.message.includes("Unexpected token '<'")) {
        throw new Error(
          "Invalid API URL or server error. Check VITE_API_URL in .env."
        );
      }

      console.error("API Request failed:", error);
      throw error;
    }
  }

  // 🔹 REGISTER
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
      message?: string;
    }>("/api/auth/register", {
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
      message?: string;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      this.setAuth(response.token, response.user);
    }

    return response;
  }

  // 🔹 FORGOT PASSWORD
  async forgotPassword(email: string) {
    return await this.request<{ success: boolean; message: string }>(
      "/api/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );
  }

  // 🔹 RESET PASSWORD
  async resetPassword(token: string, email: string, password: string) {
    return await this.request<{ success: boolean; message: string }>(
      "/api/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify({ token, email, password }),
      }
    );
  }

  // 🔹 VERIFY RESET TOKEN
  async verifyResetToken(token: string, email: string) {
    return await this.request<{ success: boolean; message: string }>(
      "/api/auth/verify-reset-token",
      {
        method: "POST",
        body: JSON.stringify({ token, email }),
      }
    );
  }

  // 🔹 PROFILE
  async getProfile() {
    return await this.request<{ success: boolean; user: any }>("/api/profile");
  }

  async updateProfile(userData: {
    fullName?: string;
    phone?: string;
    doorNumber?: string;
    buildingName?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) {
    return await this.request<{ success: boolean; user: any }>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  // 🔹 BOOKINGS
  async createBooking(bookingData: {
    senderName: string;
    senderPhone: string;
    pickupDoorNumber: string;
    pickupBuildingName?: string;
    pickupStreet: string;
    pickupCity: string;
    pickupState: string;
    pickupPincode: string;
    receiverName: string;
    receiverPhone: string;
    deliveryDoorNumber: string;
    deliveryBuildingName?: string;
    deliveryStreet: string;
    deliveryCity: string;
    deliveryState: string;
    deliveryPincode: string;
    description?: string;
    packageType: string;
    vehicleType: string;
    serviceType?: string;
    pickupDate: string;
  }) {
    return await this.request<{ success: boolean; booking: any }>(
      "/api/bookings",
      {
        method: "POST",
        body: JSON.stringify(bookingData),
      }
    );
  }

  async getUserBookings() {
    return await this.request<{ success: boolean; bookings: any[] }>(
      "/api/bookings"
    );
  }

  async getBookingById(id: string) {
    return await this.request<{ success: boolean; booking: any }>(
      `/api/bookings/${id}`
    );
  }

  // 🔹 HEALTH CHECK
  async healthCheck() {
    return await this.request<{
      success: boolean;
      message: string;
      timestamp: string;
    }>("/health");
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

  getStoredUser() {
    const userStr = localStorage.getItem("redcap_user");
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const apiService = new ApiService();
export default apiService;
