//our outloader for all modules, passes them to dashboard.tsx
import { ComponentType } from 'react';

//Module info interface
export interface ModuleInfo {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
}

// Props that each module component receives
export interface ModuleConfigProps {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}

// Module definition
export interface ModuleDefinition {
  info: ModuleInfo;
  component: ComponentType<ModuleConfigProps>;
}

// import all modules
import AMAConfig, { moduleInfo as amaInfo } from './AMAConfig';
import BotProtectionConfig, { moduleInfo as botProtectionInfo } from './BotProtectionConfig';
import AccountAgeProtectionConfig, { moduleInfo as accountAgeProtectionInfo } from './AccountAgeConfig';
import AntiNukeConfig, { moduleInfo as antiNukeInfo } from './AntiNukeConfig';
import AntiPermissionAbuseConfig, { moduleInfo as APAconfig } from './APAConfig';
import AntiSpamConfig, { moduleInfo as antiSpamInfo } from './AntiSpamConfig';

// all modules registered here
export const modules: ModuleDefinition[] = [
  { info: amaInfo, component: AMAConfig },
  { info: botProtectionInfo, component: BotProtectionConfig },
  { info: accountAgeProtectionInfo, component: AccountAgeProtectionConfig },
  { info: antiNukeInfo, component: AntiNukeConfig },
  { info: APAconfig, component: AntiPermissionAbuseConfig },
  { info: antiSpamInfo, component: AntiSpamConfig },
];

// Helper functions
export const getModuleById = (id: string): ModuleDefinition | undefined =>
  modules.find(module => module.info.id === id);

export const getModulesByCategory = (category: string): ModuleDefinition[] =>
  modules.filter(module => module.info.category === category);

export const getAllCategories = (): string[] => {
  const categories = modules
    .map(module => module.info.category)
    .filter((category): category is string => category !== undefined);

  return [...new Set(categories)].sort();
};