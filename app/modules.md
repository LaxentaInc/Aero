# Modular Configuration Structure

## Overview
This structure allows you to create separate module configuration components that can be automatically loaded and displayed in your main dashboard page.

## Directory Structure
```
src/
├── app/
│   └── dashboard/
│       └── page.tsx              # Main dashboard page
├── components/
│   └── modules/
│       ├── index.ts              # Auto-loader for modules
│       ├── AMAConfig.tsx         # AMA module component
│       ├── ModerationConfig.tsx  # Example additional module
│       └── AutomodConfig.tsx     # Example additional module
└── types/
    └── modules.ts                # Shared types
```

## Module Component Structure

Each module component should follow this pattern:

### Required Props Interface
```typescript
interface ModuleConfigProps {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}
```

### Required Exports
Each module component must export:
1. **Default component** - The main config component
2. **moduleInfo** - Metadata about the module

### Module Info Interface
```typescript
interface ModuleInfo {
  id: string;           // Unique identifier (kebab-case)
  name: string;         // Display name
  description: string;  // Short description
  icon?: string;        // Optional icon class/component
  category?: string;    // Optional category for grouping
}
```

### Example Module Component Template
```typescript
'use client';

import { useState, useEffect } from 'react';

// Module-specific interfaces
interface YourModuleConfig {
  enabled: boolean;
  // ... other config properties
}

interface ModuleConfigProps {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}

// Export module info
export const moduleInfo = {
  id: 'your-module',
  name: 'Your Module Name',
  description: 'Brief description of what this module does',
  category: 'moderation', // Optional: moderation, utility, fun, etc.
};

// Default config
const defaultConfig: YourModuleConfig = {
  enabled: true,
  // ... default values
};

export default function YourModuleConfig({ selectedGuild, onSave }: ModuleConfigProps) {
  const [config, setConfig] = useState<YourModuleConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load config when guild changes
  useEffect(() => {
    if (selectedGuild) {
      loadConfig();
    }
  }, [selectedGuild]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/your-module-config?guildId=${selectedGuild}`);
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      } else if (response.status === 404) {
        setConfig(defaultConfig);
      } else {
        throw new Error('Failed to load configuration');
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      onSave?.(false, 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!selectedGuild) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/your-module-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId: selectedGuild,
          config: config,
        }),
      });

      if (response.ok) {
        onSave?.(true, 'Configuration saved successfully!');
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      onSave?.(false, 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Your module configuration UI here */}
      
      {/* Save button */}
      <div className="pt-4 border-t border-gray-700">
        <button
          onClick={saveConfig}
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded transition-colors"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
```

## OUR Auto-loader Setup

### `components/modules/index.ts`
```typescript
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

// Import all modules
import AMAConfig, { moduleInfo as amaInfo } from './AMAConfig';
// Import other modules as you create them
// import ModerationConfig, { moduleInfo as moderationInfo } from './ModerationConfig';

// Export all modules
export const modules: ModuleDefinition[] = [
  {
    info: amaInfo,
    component: AMAConfig,
  },
  // Add other modules here
  // {
  //   info: moderationInfo,
  //   component: ModerationConfig,
  // },
];

// Helper to get module by ID
export const getModuleById = (id: string) => 
  modules.find(module => module.info.id === id);

// Helper to get modules by category
export const getModulesByCategory = (category: string) =>
  modules.filter(module => module.info.category === category);
```