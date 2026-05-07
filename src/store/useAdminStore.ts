import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types';

interface AdminState {
  agents: UserProfile[];
  currentPageTitle: string;
    
  // Actions
  setAgents: (agents: UserProfile[]) => void;
  setCurrentPageTitle: (title: string) => void;
  addAgent: (agent: UserProfile) => void;
  updateAgent: (agent: UserProfile) => void;
  deactivateAgent: (uid: string) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      agents: [
        {
          uid: 'agent-1',
          name: 'John Kamau',
          email: 'john.kamau@example.com',
          role: 'agent',
          region: 'Central',
          stockPoint: 'Nairobi Main',
          phoneNumber: '0711223344',
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
          status: 'active',
          lastActive: Date.now() - 1000 * 60 * 30, // 30 mins ago
          assignedRoutes: ['Route A', 'Route B']
        },
        {
          uid: 'agent-2',
          name: 'Sarah Wanjiku',
          email: 'sarah.w@example.com',
          role: 'agent',
          region: 'Coast',
          stockPoint: 'Mombasa Hub',
          phoneNumber: '0722334455',
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60, // 60 days ago
          status: 'active',
          lastActive: Date.now() - 1000 * 60 * 5, // 5 mins ago
          assignedRoutes: ['Route C']
        },
        {
          uid: 'agent-3',
          name: 'David Omondi',
          email: 'david.o@example.com',
          role: 'agent',
          region: 'Western',
          stockPoint: 'Kisumu Depot',
          phoneNumber: '0733445566',
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15, // 15 days ago
          status: 'inactive',
          lastActive: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
          assignedRoutes: []
        }
      ],
      currentPageTitle: 'Overview',
      
      setAgents: (agents) => set({ agents }),
      setCurrentPageTitle: (title) => set((state) => {
        if (state.currentPageTitle === title) return state;
        return { currentPageTitle: title };
      }),
      
      addAgent: (agent) => set((state) => ({ 
        agents: [...state.agents, agent] 
      })),
      
      updateAgent: (agent) => set((state) => ({
        agents: state.agents.map(a => a.uid === agent.uid ? agent : a)
      })),
      
      deactivateAgent: (uid) => set((state) => ({
        agents: state.agents.map(a => a.uid === uid ? { ...a, status: 'inactive' } : a)
      })),
    }),
    {
      name: 'admin-storage',
    }
  )
);
