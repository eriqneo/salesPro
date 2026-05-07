import { useEffect } from 'react';
import { useAdminStore } from '@/store/useAdminStore';

export function usePageTitle(title: string) {
  useEffect(() => {
    // 1. Set document title - strictly check to avoid unnecessary DOM updates
    const fullTitle = `${title} — SalesPro Admin`;
    if (document.title !== fullTitle) {
      document.title = fullTitle;
    }
    
    // 2. Update store - already protected by imperative getState() check,
    // but we can be extra careful.
    const store = useAdminStore.getState();
    if (store.currentPageTitle !== title) {
      store.setCurrentPageTitle(title);
    }
  }, [title]);
}
