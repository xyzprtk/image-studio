import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProviderConfig, Generation, PromptTemplate, DEFAULT_TEMPLATES } from '@/lib/types';

interface AppState {
  providerConfigs: ProviderConfig[];
  generations: Generation[];
  templates: PromptTemplate[];
  currentPrompt: string;
  
  setProviderConfig: (config: ProviderConfig) => void;
  removeProviderConfig: (providerId: string) => void;
  getProviderConfig: (providerId: string) => ProviderConfig | undefined;
  
  addGeneration: (generation: Generation) => void;
  updateGeneration: (id: string, updates: Partial<Generation>) => void;
  deleteGeneration: (id: string) => void;
  clearHistory: () => void;
  
  addTemplate: (template: PromptTemplate) => void;
  removeTemplate: (id: string) => void;
  
  setCurrentPrompt: (prompt: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      providerConfigs: [],
      generations: [],
      templates: DEFAULT_TEMPLATES,
      currentPrompt: '',

      setProviderConfig: (config) => {
        const configs = get().providerConfigs;
        const existing = configs.findIndex(c => c.providerId === config.providerId);
        if (existing >= 0) {
          configs[existing] = config;
          set({ providerConfigs: [...configs] });
        } else {
          set({ providerConfigs: [...configs, config] });
        }
      },

      removeProviderConfig: (providerId) => {
        set({ providerConfigs: get().providerConfigs.filter(c => c.providerId !== providerId) });
      },

      getProviderConfig: (providerId) => {
        return get().providerConfigs.find(c => c.providerId === providerId);
      },

      addGeneration: (generation) => {
        const generations = [generation, ...get().generations].slice(0, 500);
        set({ generations });
      },

      updateGeneration: (id, updates) => {
        const generations = get().generations.map(g => 
          g.id === id ? { ...g, ...updates } : g
        );
        set({ generations });
      },

      deleteGeneration: (id) => {
        set({ generations: get().generations.filter(g => g.id !== id) });
      },

      clearHistory: () => {
        set({ generations: [] });
      },

      addTemplate: (template) => {
        set({ templates: [...get().templates, template] });
      },

      removeTemplate: (id) => {
        set({ templates: get().templates.filter(t => t.id !== id) });
      },

      setCurrentPrompt: (prompt) => {
        set({ currentPrompt: prompt });
      },
    }),
    {
      name: 'image-studio-storage',
      partialize: (state) => ({
        providerConfigs: state.providerConfigs,
        generations: state.generations,
        templates: state.templates,
      }),
    }
  )
);
