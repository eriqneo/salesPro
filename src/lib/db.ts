import Dexie, { Table } from 'dexie';

export interface SyncQueueItem {
  id?: number;
  type: 'sale' | 'report' | 'inventory_add';
  payload: any;
  attempts: number;
  createdAt: number;
  status: 'pending' | 'syncing' | 'failed';
}

export interface ReportDraft {
  id: string; // agentId
  data: any;
  updatedAt: number;
}

export class SalesDatabase extends Dexie {
  syncQueue!: Table<SyncQueueItem>;
  reportDrafts!: Table<ReportDraft>;

  constructor() {
    super('SalesDatabase');
    this.version(2).stores({
      syncQueue: '++id, type, status, createdAt',
      reportDrafts: 'id'
    });
  }
}

export const db = new SalesDatabase();
