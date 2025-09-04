import { ComponentType } from 'react';

// Module info interface
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

// Import all modules here
import AMAConfig, { moduleInfo as amaInfo } from './AMAConfig';
import BotProtectionConfig, { moduleInfo as botProtectionInfo } from './BotProtectionConfig';
// Add more imports as you create modules:
// import ModerationConfig, { moduleInfo as moderationInfo } from './ModerationConfig';
// import AutomodConfig, { moduleInfo as automodInfo } from './AutomodConfig';
// import WelcomeConfig, { moduleInfo as welcomeInfo } from './WelcomeConfig';

// Export all modules - this is where the magic happens!
export const modules: ModuleDefinition[] = [
  {
    info: amaInfo,
    component: AMAConfig,
  },
  {
    info: botProtectionInfo,
    component: BotProtectionConfig,
  },
  // Add new modules here:
  // {
  //   info: moderationInfo,
  //   component: ModerationConfig,
  // },
  // {
  //   info: automodInfo,
  //   component: AutomodConfig,
  // },
  // {
  //   info: welcomeInfo,
  //   component: WelcomeConfig,
  // },
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