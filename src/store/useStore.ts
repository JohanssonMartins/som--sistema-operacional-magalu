import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, ChecklistItem, Autoauditoria } from '../data';

interface AppState {
  currentUser: User | null;
  theme: 'dark' | 'light';
  selectedUnit: string;
  isSidebarCollapsed: boolean;
  activeTab: string;
  
  // Dados de Cache/Global
  items: ChecklistItem[];
  baseItems: ChecklistItem[];
  usersList: User[];
  allAutoauditorias: Autoauditoria[];
  autoauditoriaData: Record<string, { score: string; nossaAcao: string; evidencias?: any[] }>;

  // Actions
  setCurrentUser: (user: User | null) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setSelectedUnit: (unit: string) => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tab: string) => void;
  
  setItems: (items: ChecklistItem[]) => void;
  setBaseItems: (items: ChecklistItem[]) => void;
  setUsersList: (users: User[]) => void;
  setAllAutoauditorias: (audits: Autoauditoria[]) => void;
  setAutoauditoriaData: (data: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void;

  autoauditoriaMesAno: string;
  setAutoauditoriaMesAno: (mesAno: string) => void;

  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      theme: 'dark',
      selectedUnit: 'Todas',
      isSidebarCollapsed: false,
      activeTab: 'home',
      
      items: [],
      baseItems: [],
      usersList: [],
      allAutoauditorias: [],
      autoauditoriaData: {},

      autoauditoriaMesAno: (() => {
        const d = new Date();
        const mes = d.toLocaleString('pt-BR', { month: 'long' });
        const ano = d.getFullYear();
        return `${mes.charAt(0).toUpperCase() + mes.slice(1)}-${ano}`;
      })(),

      setCurrentUser: (user) => set({ currentUser: user }),
      setTheme: (theme) => set({ theme }),
      setSelectedUnit: (unit) => set({ selectedUnit: unit }),
      setIsSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      setItems: (items) => set({ items }),
      setBaseItems: (baseItems) => set({ baseItems }),
      setUsersList: (usersList) => set({ usersList }),
      setAllAutoauditorias: (allAutoauditorias) => set({ allAutoauditorias }),
      setAutoauditoriaMesAno: (autoauditoriaMesAno) => set({ autoauditoriaMesAno }),
      setAutoauditoriaData: (data) => set((state) => ({
        autoauditoriaData: typeof data === 'function' ? data(state.autoauditoriaData) : data
      })),

      logout: () => set({ 
        currentUser: null, 
        activeTab: 'home', 
        selectedUnit: 'Todas' 
      }),
    }),
    {
      name: 'som-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        theme: state.theme,
        selectedUnit: state.selectedUnit,
        isSidebarCollapsed: state.isSidebarCollapsed,
        activeTab: state.activeTab,
      }),
    }
  )
);
