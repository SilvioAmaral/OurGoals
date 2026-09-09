import { create } from 'zustand';
import { saveToken, clearToken } from '../api/client';
import { authApi, userApi } from '../api';
import * as SecureStore from 'expo-secure-store';

export interface User {
  _id: string;
  name: string;
  email: string;
  theme: 'purple' | 'rose' | 'teal' | 'sunset';
  sexualityEnabled: boolean;
  partnerNickname?: string;
  coupleId?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setupDone: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadMe: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  completeSetup: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setupDone: false,

  register: async (name, email, password) => {
    const { data } = await authApi.register(name, email, password);
    await saveToken(data.token);
    set({ user: data.user });
  },

  login: async (email, password) => {
    const { data } = await authApi.login(email, password);
    await saveToken(data.token);
    set({ user: data.user });
  },

  logout: async () => {
    await clearToken();
    set({ user: null, setupDone: false });
  },

  completeSetup: () => set({ setupDone: true }),

  loadMe: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) { set({ loading: false }); return; }
      const { data } = await userApi.me();
      set({ user: data.user, loading: false });
    } catch {
      await clearToken();
      set({ loading: false });
    }
  },

  updateUser: (data) => set(s => ({ user: s.user ? { ...s.user, ...data } : s.user })),
}));
