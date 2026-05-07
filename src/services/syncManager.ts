import { db, SyncQueueItem } from '@/lib/db';
import { toast } from 'sonner';

class SyncManager {
  private isSyncing = false;

  async addToQueue(type: SyncQueueItem['type'], payload: any) {
    await db.syncQueue.add({
      type,
      payload,
      attempts: 0,
      createdAt: Date.now(),
      status: 'pending'
    });
    
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const pendingItems = await db.syncQueue
      .where('status')
      .anyOf(['pending', 'failed'])
      .toArray();

    if (pendingItems.length === 0) {
      this.isSyncing = false;
      return;
    }

    let successCount = 0;

    for (const item of pendingItems) {
      if (item.attempts >= 3) continue;

      try {
        await db.syncQueue.update(item.id!, { status: 'syncing' });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, you'd call your backend here
        // await api.sync(item.type, item.payload);

        await db.syncQueue.delete(item.id!);
        successCount++;
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        await db.syncQueue.update(item.id!, { 
          status: 'failed', 
          attempts: item.attempts + 1 
        });
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} items synced successfully`);
    }

    this.isSyncing = false;
    
    // Check if there are still items to process
    const remaining = await db.syncQueue.count();
    if (remaining > 0 && navigator.onLine) {
      setTimeout(() => this.processQueue(), 5000);
    }
  }

  async getQueueCount() {
    return await db.syncQueue.count();
  }
}

export const syncManager = new SyncManager();
