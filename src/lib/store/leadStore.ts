// src/lib/store/leadStore.ts
import { create } from 'zustand';

interface LeadStoreState {
  selectedLeadIds: Set<string>;
  toggleLead: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  bulkMode: boolean;
  setBulkMode: (mode: boolean) => void;
  importProgress: number;
  setImportProgress: (progress: number) => void;
}

export const useLeadStore = create<LeadStoreState>((set) => ({
  selectedLeadIds: new Set<string>(),
  toggleLead: (id) =>
    set((state) => {
      const next = new Set(state.selectedLeadIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedLeadIds: next };
    }),
  selectAll: (ids) => set({ selectedLeadIds: new Set(ids) }),
  clearSelection: () => set({ selectedLeadIds: new Set() }),
  bulkMode: false,
  setBulkMode: (mode) => set({ bulkMode: mode }),
  importProgress: 0,
  setImportProgress: (progress) => set({ importProgress: progress }),
}));
