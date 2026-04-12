import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  receivedBalance?: number;
  givingBudget?: { remaining: number; month: string };
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, accessToken: string) => void;
  setToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, accessToken) => set({ user, token: accessToken }),
      setToken: (accessToken) => set({ token: accessToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'good-job-auth' },
  ),
);
