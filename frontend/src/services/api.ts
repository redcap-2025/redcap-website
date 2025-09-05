// services/api.ts

// ✅ Use environment variable (recommended)
const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000";

// 🔍 Validate API URL at runtime
if (!API_BASE_URL.startsWith("http")) {
  console.error("❌ Invalid VITE_API_URL:", API_BASE_URL);
  throw new Error("Invalid API URL. Must start with http:// or https://");
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("redcap_token");
  }

  /**
   * Generic request handler with auth, JSON support, and robust error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = new URL(endpoint, API_BASE_URL).href;

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

      // ✅ Guard against non-JSON responses (e.g., HTML error pages)
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        console.error("❌ Non-JSON response from server:", text);
        throw new Error(
          "Server returned an invalid response. Check your internet connection or contact support."
        );
      }

      const data = (await response.json()) as T & {
        success?: boolean;
        error?: string;
        message?: string;
      };

      // ✅ Handle API-level errors (4xx, 5xx with JSON body)
      if (!response.ok) {
        const errorMsg =
          data.message ||
          data.error ||
          response.statusText ||
          "Request failed due to server error.";
        throw new Error(errorMsg);
      }

      return data;
    } catch (error: any) {
      // ✅ Improve user-friendly error messages
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to the server. Please check your internet connection."
        );
      }

      if (error.message.includes("Unexpected token '<'")) {
        throw new Error(
          `Invalid API response. Check if the backend is running at ${API_BASE_URL}.`
        );
      }

      if (error.message.includes("Invalid API URL")) {
        throw new Error(
          "Configuration error: Please check VITE_API_URL in your .env file."
        );
      }

      console.error("API Request failed:", error);
      throw new Error(error.message || "An unknown error occurred.");
    }
  }

  // 🔹 AUTH: REGISTER
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

  // 🔹 AUTH: LOGIN
  async login(email: string, password: string) {
    const response = await this.request<{
      success: boolean;
      user: any;
      token: string;
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

  // 🔹 AUTH: FORGOT PASSWORD
  async forgotPassword(email: string) {
    const response = await this.request<{
      success: boolean;
      message: string;
    }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    return response;
  }

  // 🔹 AUTH: RESET PASSWORD
  async resetPassword(token: string, email: string, password: string) {
    const response = await this.request<{
      success: boolean;
      message: string;
    }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, email, password }),
    });

    return response;
  }

  // 🔹 AUTH: VERIFY RESET TOKEN
  async verifyResetToken(token: string, email: string) {
    const response = await this.request<{
      success: boolean;
      message: string;
    }>("/api/auth/verify-reset-token", {
      method: "POST",
      body: JSON.stringify({ token, email }),
    });

    return response;
  }

  // 🔹 PROFILE: GET
  async getProfile() {
    return await this.request<{ success: boolean; user: any }>("/api/profile");
  }

  // 🔹 PROFILE: UPDATE
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

  // 🔹 BOOKINGS: CREATE
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
    return await this.request<{ success: boolean; booking: any }>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  // 🔹 BOOKINGS: LIST ALL
  async getUserBookings() {
    return await this.request<{ success: boolean; bookings: any[] }>("/api/bookings");
  }

  // 🔹 BOOKINGS: GET BY ID
  async getBookingById(id: string) {
    return await this.request<{ success: boolean; booking: any }>(`/api/bookings/${id}`);
  }

  // 🔹 HEALTH CHECK (for debugging or status)
  async healthCheck() {
    return await this.request<{ success: boolean; message: string; timestamp?: string }>(
      "/api/health"
    );
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
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error("❌ Failed to parse stored user:", e);
      this.logout(); // Clear corrupted data
      return null;
    }
  }

  // Optional: Refresh token logic (if needed later)
  setToken(token: string) {
    this.token = token;
    localStorage.setItem("redcap_token", token);
  }
}

// 🔥 Export singleton instance
export const apiService = new ApiService();
export default apiService;