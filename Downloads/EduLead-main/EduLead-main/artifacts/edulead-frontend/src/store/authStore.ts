import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Plan = 'basic' | 'pro' | 'premium';
export type Role = 'superadmin' | 'college_admin' | 'college_staff' | 'agency_admin';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  tenantId: string | null;
  tenantName: string | null;
  plan: Plan | null;
  role: Role | null;
  isAuthenticated: boolean;
  setAuth: (data: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    tenantId: string;
    tenantName: string;
    plan: Plan;
    role: Role;
  }) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      tenantId: null,
      tenantName: null,
      plan: null,
      role: null,
      isAuthenticated: false,
      setAuth: (data) =>
        set({
          ...data,
          isAuthenticated: true,
        }),
      setAccessToken: (token) => set({ accessToken: token }),
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          tenantId: null,
          tenantName: null,
          plan: null,
          role: null,
          isAuthenticated: false,
        }),
    }),
    { name: 'edulead-auth' }
  )
);
