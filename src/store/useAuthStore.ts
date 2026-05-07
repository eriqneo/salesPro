import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UserPreferences } from '@/types';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  logout: () => void;
}

const defaultPreferences: UserPreferences = {
  eodReportReminder: true,
  eodReportTime: "17:30",
  dailyTargetAlert: true,
  lowStockWarning: true,
  syncAlerts: true,
  adminMessages: true,
  language: 'en',
  textSize: 'normal',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setUser: (user) => {
        if (user && !user.preferences) {
          user.preferences = { ...defaultPreferences };
        }
        set({ user, loading: false });
      },
      setLoading: (loading) => set({ loading }),
      updateProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      updatePreferences: (updates) => set((state) => ({
        user: state.user ? {
          ...state.user,
          preferences: { ...state.user.preferences!, ...updates }
        } : null
      })),
      logout: () => {
        localStorage.removeItem('auth-storage');
        set({ user: null, loading: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
