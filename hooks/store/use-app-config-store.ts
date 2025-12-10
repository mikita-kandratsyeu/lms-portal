import { create } from 'zustand';

import { GetAppConfig } from '@/actions/configs/get-app-config';

type AppConfigStore = {
  config: GetAppConfig | null;
  setConfig: (config: GetAppConfig) => void;
};

export const useAppConfigStore = create<AppConfigStore>((set) => ({
  config: null,
  setConfig: (config) => set({ config }),
}));
