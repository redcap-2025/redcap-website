// types/user.ts
export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  password?: string; // Only used in forms, not stored in context
  doorNumber: string;
  buildingName?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string; // ISO date string: "2025-04-05T10:00:00.000Z"
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}