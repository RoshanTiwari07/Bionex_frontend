import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '../api/types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  txnId: string | null;

  setUser: (user: AuthUser) => void;
  setTxnId: (txnId: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  txnId: null,

  setUser: (user) => set({ user, isAuthenticated: true }),
  setTxnId: (txnId) => set({ txnId }),

  logout: async () => {
    await AsyncStorage.multiRemove(['@bionex_access_token', '@bionex_refresh_token']);
    set({ user: null, isAuthenticated: false, txnId: null });
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('@bionex_access_token');
      if (token) {
        // In production, decode JWT and validate expiry
        // For mock, set a default user
        set({
          user: {
            id: 'user-001',
            name: 'Prajesh Kumar',
            phone: '+919876543210',
            abhaId: '12-3456-7890-1234',
            abhaAddress: 'prajesh.kumar@abdm',
            gender: 'MALE',
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));
