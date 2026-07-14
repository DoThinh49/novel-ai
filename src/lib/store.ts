// ============================================================
// Zustand Store — Global Application State
// ============================================================

import { create } from 'zustand';
import type { AutoWriteState, WizardState } from '@/types';

// --- Wizard Store ---
interface WizardStore extends WizardState {
  setStep: (step: 1 | 2 | 3 | 4) => void;
  setProjectId: (id: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useWizardStore = create<WizardStore>((set) => ({
  currentStep: 1,
  projectId: null,
  isComplete: false,

  setStep: (step) => set({ currentStep: step }),
  setProjectId: (id) => set({ projectId: id }),
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 4) as 1 | 2 | 3 | 4,
    })),
  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1) as 1 | 2 | 3 | 4,
    })),
  reset: () => set({ currentStep: 1, projectId: null, isComplete: false }),
}));

// --- Auto-Write Store ---
interface AutoWriteStore extends AutoWriteState {
  setStatus: (status: AutoWriteState['status']) => void;
  setCurrentChapter: (chapter: number) => void;
  setTotalChapters: (total: number) => void;
  setError: (error: string | undefined) => void;
  reset: () => void;
}

export const useAutoWriteStore = create<AutoWriteStore>((set) => ({
  status: 'idle',
  currentChapter: 0,
  totalChapters: 0,
  error: undefined,

  setStatus: (status) => set({ status }),
  setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
  setTotalChapters: (total) => set({ totalChapters: total }),
  setError: (error) => set({ error }),
  reset: () =>
    set({ status: 'idle', currentChapter: 0, totalChapters: 0, error: undefined }),
}));

// --- Theme Store ---
interface ThemeStore {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'dark',
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setTheme: (theme) => set({ theme }),
}));

// --- Sidebar Store ---
interface SidebarStore {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
