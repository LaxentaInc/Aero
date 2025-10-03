'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';

// Types
interface AMAConfig {
  enabled: boolean;
  kickThreshold: number;
  banThreshold: number;
  timeWindow: number;
  trustedUsers: string[];
  trustedRoles: string[];
  bypassTrusted: boolean;
  punishmentActions: string[];
  timeoutDuration: number;
  notifyOwner: boolean;
  logChannelId: string | null;
  logActions: boolean;
  debug: boolean;
}

interface AMADocument {
  guildId: string;
  config: AMAConfig;
  lastUpdated: string;
  createdAt: string;
}

interface ModuleConfigProps {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}

// Export module info for auto-loader (index.ts file)
export const moduleInfo = {
  id: 'anti-mass-action',
  name: 'Anti Mass Action Protection',
  description: 'Protect against mass kicks, bans and Admin Power trips',
  category: 'moderation',
};

const defaultConfig: AMAConfig = {
  enabled: true,
  kickThreshold: 5,
  banThreshold: 5,
  timeWindow: 300,
  trustedUsers: [],
  trustedRoles: [],
  bypassTrusted: true,
  punishmentActions: ['remove_roles', 'timeout'],
  timeoutDuration: 600,
  notifyOwner: true,
  logChannelId: null,
  logActions: true,
  debug: false
};

const punishmentOptions = [
  { value: 'remove_roles', label: 'Remove Roles' },
  { value: 'timeout', label: 'Timeout Member' },
  { value: 'kick', label: 'Kick Member' },
  { value: 'ban', label: 'Ban Member' },
  { value: 'notify', label: 'Notify Owner' }
];

export default function AMAConfig({ selectedGuild, onSave }: ModuleConfigProps) {
  const [config, setConfig] = useState<AMAConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { getCached, setCached, invalidate: _invalidate } = useConfigCache();

  // Load config when guild is selected
  useEffect(() => {
    if (selectedGuild) {
      loadConfig();
    }
  }, [selectedGuild]);

  const loadConfig = async () => {
    const cacheKey = `AMA-pro-${selectedGuild}`;
    const cached = getCached(cacheKey);
    if (cached) {
      setConfig(cached);
      return; // Skip API call
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/ama-config?guildId=${selectedGuild}`);
      
      if (response.ok) {
        const data: AMADocument = await response.json();
        setConfig(data.config);
        setCached(cacheKey, data.config); // CACHE IT

      } else if (response.status === 404) {
        // No config exists, use defaults
        setConfig(defaultConfig);
        setCached(cacheKey, defaultConfig); // CACHE DEFAULT
      } else if (response.status === 429) {
        setConfig(defaultConfig);

      } else {
        throw new Error('Failed to load configuration');
      }
    } catch (error) {
      // console.error('Failed to load config:', error);
      // onSave?.(false, 'Failed to load configuration');
        setConfig(defaultConfig); // graceful fallback

    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!selectedGuild) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/ama-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guildId: selectedGuild,
          config: config,
        }),
      });

      if (response.ok) {
        const cacheKey = `AMA-pro-${selectedGuild}`;
        setCached(cacheKey, config); // Update cache with new config

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

  const updateConfig = (key: keyof AMAConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const addTrustedUser = () => {
    const userId = prompt('Enter Discord User ID:');
    if (userId && !config.trustedUsers.includes(userId)) {
      updateConfig('trustedUsers', [...config.trustedUsers, userId]);
    }
  };

  const removeTrustedUser = (userId: string) => {
    updateConfig('trustedUsers', config.trustedUsers.filter(id => id !== userId));
  };

  const addTrustedRole = () => {
    const roleId = prompt('Enter Discord Role ID:');
    if (roleId && !config.trustedRoles.includes(roleId)) {
      updateConfig('trustedRoles', [...config.trustedRoles, roleId]);
    }
  };

  const removeTrustedRole = (roleId: string) => {
    updateConfig('trustedRoles', config.trustedRoles.filter(id => id !== roleId));
  };

  const togglePunishmentAction = (action: string) => {
    const current = config.punishmentActions;
    if (current.includes(action)) {
      updateConfig('punishmentActions', current.filter(a => a !== action));
    } else {
      updateConfig('punishmentActions', [...current, action]);
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
      {/* Basic Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-400">Basic Settings</h3>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Module Enabled</label>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => updateConfig('enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">Kick Threshold</label>
            <input
              type="number"
              min="1"
              max="50"
              value={config.kickThreshold}
              onChange={(e) => updateConfig('kickThreshold', parseInt(e.target.value) || 1)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ban Threshold</label>
            <input
              type="number"
              min="1"
              max="50"
              value={config.banThreshold}
              onChange={(e) => updateConfig('banThreshold', parseInt(e.target.value) || 1)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Time Window (seconds)</label>
            <input
              type="number"
              min="60"
              max="3600"
              value={config.timeWindow}
              onChange={(e) => updateConfig('timeWindow', parseInt(e.target.value) || 60)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-green-400">Protection Settings</h3>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Bypass Trusted Users/Roles</label>
            <input
              type="checkbox"
              checked={config.bypassTrusted}
              onChange={(e) => updateConfig('bypassTrusted', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Timeout Duration (seconds)</label>
            <input
              type="number"
              min="60"
              max="2419200"
              value={config.timeoutDuration}
              onChange={(e) => updateConfig('timeoutDuration', parseInt(e.target.value) || 60)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Punishment Actions</label>
            <div className="space-y-2">
              {punishmentOptions.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={option.value}
                    checked={config.punishmentActions.includes(option.value)}
                    onChange={() => togglePunishmentAction(option.value)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 mr-2"
                  />
                  <label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Logging Settings */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-purple-400 mb-4">Logging & Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Notify Owner</label>
            <input
              type="checkbox"
              checked={config.notifyOwner}
              onChange={(e) => updateConfig('notifyOwner', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Log Actions</label>
            <input
              type="checkbox"
              checked={config.logActions}
              onChange={(e) => updateConfig('logActions', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Debug Mode</label>
            <input
              type="checkbox"
              checked={config.debug}
              onChange={(e) => updateConfig('debug', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Log Channel ID (optional)</label>
          <input
            type="text"
            placeholder="Enter Discord Channel ID"
            value={config.logChannelId || ''}
            onChange={(e) => updateConfig('logChannelId', e.target.value || null)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Trusted Users & Roles */}
      <div className="border-t border-gray-700 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trusted Users */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-yellow-400">Trusted Users</h3>
              <button
                onClick={addTrustedUser}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Add User
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {config.trustedUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">No trusted users configured</p>
              ) : (
                config.trustedUsers.map((userId) => (
                  <div key={userId} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                    <span className="text-sm font-mono">{userId}</span>
                    <button
                      onClick={() => removeTrustedUser(userId)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Trusted Roles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-yellow-400">Trusted Roles</h3>
              <button
                onClick={addTrustedRole}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Add Role
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {config.trustedRoles.length === 0 ? (
                <p className="text-gray-500 text-sm">No trusted roles configured</p>
              ) : (
                config.trustedRoles.map((roleId) => (
                  <div key={roleId} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                    <span className="text-sm font-mono">{roleId}</span>
                    <button
                      onClick={() => removeTrustedRole(roleId)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t border-gray-700 pt-6">
        <button
          onClick={saveConfig}
          disabled={saving || !selectedGuild}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Configuration Preview */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-400 mb-3">Current Configuration</h3>
        <div className="bg-gray-900 rounded-lg p-4 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-400">Status:</span>
              <span className={`ml-2 ${config.enabled ? 'text-green-400' : 'text-red-400'}`}>
                {config.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Kick Limit:</span>
              <span className="ml-2 text-yellow-400">{config.kickThreshold}</span>
            </div>
            <div>
              <span className="text-gray-400">Ban Limit:</span>
              <span className="ml-2 text-yellow-400">{config.banThreshold}</span>
            </div>
            <div>
              <span className="text-gray-400">Time Window:</span>
              <span className="ml-2 text-yellow-400">{config.timeWindow}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}