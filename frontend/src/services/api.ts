const API_BASE_URL = "http://localhost:8000/api";

class ApiService {
  private token: string | null = null;

  constructor() {
    // Get token from localStorage on initialization
    this.token = localStorage.getItem("redcap_token");
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // 🔹 REGISTER + Auto-login
  async register(userData: {
    fullName: string;   // ✅ must match backend
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
    const response = await this.request("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success && response.token) {
      this.token = response.token;
      localStorage.setItem("redcap_token", response.token);
      localStorage.setItem("redcap_user", JSON.stringify(response.user));
    }

    return response;
  }

  // 🔹 LOGIN
  async login(email: string, password: string) {
    const response = await this.request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      this.token = response.token;
      localStorage.setItem("redcap_token", response.token);
      localStorage.setItem("redcap_user", JSON.stringify(response.user));
    }

    return response;
  }

  async getProfile() {
    return await this.request("/profile");
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
    return await this.request("/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async createBooking(bookingData: any) {
    return await this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async getUserBookings() {
    return await this.request("/bookings");
  }

  async healthCheck() {
    return await this.request("/health");
  }

  logout() {
    this.token = null;
    localStorage.removeItem("redcap_token");
    localStorage.removeItem("redcap_user");
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();
export default apiService;
