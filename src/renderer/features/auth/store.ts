import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

interface AuthState {
  token: string | null;
  role: string | null;
  forcePasswordChange: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  forcePasswordChange: false,

  login: (token) => {
    const decoded: any = jwtDecode(token);

    set({
      token,
      role: decoded.role,
      forcePasswordChange: decoded.forcePasswordChange,
    });
  },

  logout: () =>
    set({
      token: null,
      role: null,
      forcePasswordChange: false,
    }),
}));
