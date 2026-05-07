import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export const useConnectivity = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const pendingSyncs = useLiveQuery(
    () => db.syncQueue.count(),
    []
  ) || 0;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    pendingSyncs,
    status: isOnline ? 'online' : 'offline'
  };
};
