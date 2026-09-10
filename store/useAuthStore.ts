import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedBuild {
  id: string;
  model: string;
  caseColor: string;
  keycapColor: string;
  switchType: string;
  dateSaved: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: "PROCESSING" | "SHIPPED" | "DELIVERED";
  items: Array<{ title: string; quantity: number }>;
}

export interface User {
  id: string;
  email: string;
  joinDate: string;
}

interface AuthStore {
  user: User | null;
  savedBuilds: SavedBuild[];
  orderHistory: Order[];
  isLoginModalOpen: boolean;
  
  // Actions
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (email: string) => void;
  logout: () => void;
  saveBuild: (build: Omit<SavedBuild, "id" | "dateSaved">) => void;
  deleteBuild: (id: string) => void;
  addMockOrder: (order: Omit<Order, "id" | "date" | "status">) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      savedBuilds: [],
      orderHistory: [
        // Populate with a mock past order so the dashboard isn't empty for testing
        {
          id: "ORD-8924-XX",
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
          total: 515.0,
          status: "DELIVERED",
          items: [{ title: "Aura Titan-65 Custom Mechanical", quantity: 1 }]
        }
      ],
      isLoginModalOpen: false,

      openLoginModal: () => set({ isLoginModalOpen: true }),
      closeLoginModal: () => set({ isLoginModalOpen: false }),

      login: (email: string) => {
        const mockUserId = `OP_${Math.floor(Math.random() * 9000) + 1000}`;
        set({
          user: {
            id: mockUserId,
            email,
            joinDate: new Date().toISOString(),
          },
          isLoginModalOpen: false,
        });
      },

      logout: () => set({ user: null }),

      saveBuild: (build) => {
        const newBuild: SavedBuild = {
          ...build,
          id: `BLD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          dateSaved: new Date().toISOString(),
        };
        set((state) => ({ savedBuilds: [newBuild, ...state.savedBuilds] }));
      },

      deleteBuild: (id) => {
        set((state) => ({
          savedBuilds: state.savedBuilds.filter((b) => b.id !== id),
        }));
      },

      addMockOrder: (order) => {
        const newOrder: Order = {
          ...order,
          id: `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          date: new Date().toISOString(),
          status: "PROCESSING",
        };
        set((state) => ({ orderHistory: [newOrder, ...state.orderHistory] }));
      },
    }),
    {
      name: "aura-auth-storage",
    }
  )
);
