import { create } from 'zustand';
import { ThemeName } from '../theme/colors';
import { categoryApi, itemApi, partnerApi, progressApi, matchApi } from '../api';

export interface Category {
  _id: string;
  name: string;
  colorHue: number;
  order: number;
  isSystem: boolean;
  totalItems: number;
  ratedByMe: number;
  subCount: number;
}

export interface Item {
  _id: string;
  name: string;
  order: number;
  myRating: number | null;
  partnerRating: number | null;
}

export interface Partner {
  status: 'none' | 'pending' | 'accepted';
  inviteContact?: string;
  partner: { name: string; email: string } | null;
}

export interface MatchResult {
  overallMatchPercent: number;
  sharedHighItems: {
    itemId: string;
    name: string;
    categoryName: string;
    myRating: number;
    partnerRating: number;
  }[];
  byCategory: {
    categoryId: string;
    name: string;
    colorHue: number;
    matchPercent: number;
    ratedByBoth: number;
  }[];
  totalRatedByBoth: number;
}

export interface ProgressResult {
  overall: { rated: number; total: number; percent: number };
  categories: {
    categoryId: string;
    name: string;
    colorHue: number;
    rated: number;
    total: number;
    percent: number;
  }[];
}

interface AppState {
  theme: ThemeName;
  categories: Category[];
  partner: Partner | null;
  match: MatchResult | null;
  progress: ProgressResult | null;

  setTheme: (t: ThemeName) => void;
  fetchCategories: () => Promise<void>;
  fetchPartner: () => Promise<void>;
  fetchMatch: () => Promise<void>;
  fetchProgress: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  toggleSexuality: (enabled: boolean) => Promise<void>;
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'purple',
  categories: [],
  partner: null,
  match: null,
  progress: null,

  setTheme: (t) => set({ theme: t }),

  fetchCategories: async () => {
    const { data } = await categoryApi.list();
    set({ categories: data.categories });
  },

  fetchPartner: async () => {
    const { data } = await partnerApi.get();
    set({ partner: data });
  },

  fetchMatch: async () => {
    try {
      const { data } = await matchApi.get();
      set({ match: data });
    } catch {
      set({ match: null });
    }
  },

  fetchProgress: async () => {
    const { data } = await progressApi.get();
    set({ progress: data });
  },

  addCategory: async (name) => {
    await categoryApi.create(name);
    await get().fetchCategories();
  },

  deleteCategory: async (id) => {
    await categoryApi.delete(id);
    set(s => ({ categories: s.categories.filter(c => c._id !== id) }));
  },

  toggleSexuality: async (enabled) => {
    await categoryApi.toggleSexuality(enabled);
    await get().fetchCategories();
  },

  reset: () => set({ categories: [], partner: null, match: null, progress: null, theme: 'purple' }),
}));
