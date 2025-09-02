export interface User {
  id: number;
  fullName: string;   // ✅ matches backend + form
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

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}