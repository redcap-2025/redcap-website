// src/types/user.ts

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  doorNumber: string;
  buildingName?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
}

// ✅ Add and export RegisterUserData
export interface RegisterUserData {
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
}

// Optional: For profile updates
export interface UpdateUserData {
  fullName?: string;
  phone?: string;
  doorNumber?: string;
  buildingName?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}