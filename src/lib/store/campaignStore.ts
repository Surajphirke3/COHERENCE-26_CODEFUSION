// src/lib/store/campaignStore.ts
import { create } from 'zustand';

interface CampaignStoreState {
  activeCampaignId: string | null;
  setActiveCampaign: (id: string | null) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  page: number;
  setPage: (page: number) => void;
}

export const useCampaignStore = create<CampaignStoreState>((set) => ({
  activeCampaignId: null,
  setActiveCampaign: (id) => set({ activeCampaignId: id }),
  statusFilter: 'all',
  setStatusFilter: (status) => set({ statusFilter: status, page: 1 }),
  page: 1,
  setPage: (page) => set({ page }),
}));
