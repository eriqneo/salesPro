import { create } from 'zustand';

interface UIState {
  isRecordSaleOpen: boolean;
  isNotificationsOpen: boolean;
  isProfileMenuOpen: boolean;
  setRecordSaleOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setProfileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isRecordSaleOpen: false,
  isNotificationsOpen: false,
  isProfileMenuOpen: false,
  setRecordSaleOpen: (open) => set({ isRecordSaleOpen: open }),
  setNotificationsOpen: (open) => set({ isNotificationsOpen: open }),
  setProfileMenuOpen: (open) => set({ isProfileMenuOpen: open }),
}));
