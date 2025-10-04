'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';


  // Types
  interface AccountAgeConfig {
    enabled: boolean;
    minAccountAge: number;
    action: string;
  timeoutDuration: number;
  logChannelId: string | null;
  trustedUsers: string[];
  trustedRoles: string[];
  bypassTrusted: boolean;
  logActions: boolean;
  debug: boolean;
}

interface AccountAgeDocument {
  guildId: string;
  config: AccountAgeConfig;
  lastUpdated: string;
  createdAt: string;
}

interface ModuleConfigProps {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}

// Export module info for auto-loader (index.ts file)
export const moduleInfo = {
  id: 'account-age-protection',
  name: 'Account Age Protection',
  description: 'Protect against new/suspicious accounts',
  category: 'security',
  //icon: '🔒'
};

const defaultConfig: AccountAgeConfig = {
  enabled: true,
  minAccountAge: 7,
  action: 'notify',
  timeoutDuration: 600,
  logChannelId: null,
  trustedUsers: [],
  trustedRoles: [],
  bypassTrusted: true,
  logActions: true,
  debug: false
};

const actionOptions = [
  { value: 'notify', label: 'Notify Only', color: 'text-blue-400' },
  { value: 'kick', label: 'Kick Member', color: 'text-orange-400' },
  { value: 'ban', label: 'Ban Member', color: 'text-red-400' },
  { value: 'timeout', label: 'Timeout Member', color: 'text-yellow-400' }
];

const validateNumberInput = (value: string, min: number, max?: number): number => {
  const numValue = parseInt(value);
  
  if (isNaN(numValue)) return min;
  if (numValue < min) return min;
  if (max !== undefined && numValue > max) return max;
  
  return numValue;
};
// Then update each number input with proper validation:
export default function AccountAgeProtection({ selectedGuild, onSave }: ModuleConfigProps) {
  const [config, setConfig] = useState<AccountAgeConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { getCached, setCached, invalidate: _invalidate } = useConfigCache(); //invalidate is there for future  


  // Load config when guild is selected
  useEffect(() => {
    if (selectedGuild) {
      loadConfig();
    }
  }, [selectedGuild]);

  const loadConfig = async () => {

       const cacheKey = `account-age-${selectedGuild}`;
    const cached = getCached(cacheKey);
    
    if (cached) {
      setConfig(cached);
      return; // Skip API call
    }


    setLoading(true);
    try {
      const response = await fetch(`/api/account-age-protection?guildId=${selectedGuild}`);
      
      if (response.ok) {
        const data: AccountAgeDocument = await response.json();
        setConfig(data.config);
        setCached(cacheKey, data.config); // CACHE IT

      } else if (response.status === 404) {
        // No config exists, use defaults
        setConfig(defaultConfig);
        setCached(cacheKey, defaultConfig); // CACHE DEFAULT

      } else if (response.status === 429) {
        console.warn('Rate limited, using defaults');
        setConfig(defaultConfig);
      
      } else {
        throw new Error('Failed to load configuration');
      }
    } catch (error) {
      // console.error('Failed to load config:', error);
      // onSave?.(false, 'Failed to load configuration');
            // setConfig(defaultConfig); //  fallback
                    setCached(cacheKey, defaultConfig); // CACHE DEFAULT


    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!selectedGuild) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/account-age-protection', {
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
                const cacheKey = `account-age-${selectedGuild}`;
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

  const updateConfig = (key: keyof AccountAgeConfig, value: any) => {
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

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
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
            <label className="block text-sm font-medium mb-1">
              Minimum Account Age (days)
              <span className="text-gray-400 ml-1">({config.minAccountAge} days)</span>
            </label>
            <input
              type="range"
              min="1"
              max="365"
              value={config.minAccountAge}
              onChange={(e) => updateConfig('minAccountAge', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 day</span>
              <span>1 year</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Action to Take</label>
            <div className="space-y-2">
              {actionOptions.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    id={option.value}
                    name="action"
                    value={option.value}
                    checked={config.action === option.value}
                    onChange={(e) => updateConfig('action', e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 mr-3"
                  />
                  <label htmlFor={option.value} className={`text-sm ${option.color}`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
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

          {config.action === 'timeout' && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Timeout Duration 
                <span className="text-gray-400 ml-1">({formatDuration(config.timeoutDuration)})</span>
              </label>
              <input
                type="range"
                min="60"
                max="86400"
                step="60"
                value={config.timeoutDuration}
                onChange={(e) => updateConfig('timeoutDuration', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1m</span>
                <span>24h</span>
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Security Level</h4>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                config.minAccountAge >= 30 ? 'bg-green-500' :
                config.minAccountAge >= 14 ? 'bg-yellow-500' :
                config.minAccountAge >= 7 ? 'bg-orange-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-400">
                {config.minAccountAge >= 30 ? 'High Security' :
                 config.minAccountAge >= 14 ? 'Medium Security' :
                 config.minAccountAge >= 7 ? 'Balanced' : 'Low Security'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logging Settings */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-purple-400 mb-4">Logging & Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            placeholder="Enter Discord Channel ID for logging"
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
              <span className="text-gray-400">Min Age:</span>
              <span className="ml-2 text-yellow-400">{config.minAccountAge} days</span>
            </div>
            <div>
              <span className="text-gray-400">Action:</span>
              <span className={`ml-2 capitalize ${
                actionOptions.find(a => a.value === config.action)?.color || 'text-gray-400'
              }`}>
                {config.action}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Trusted Bypass:</span>
              <span className={`ml-2 ${config.bypassTrusted ? 'text-green-400' : 'text-red-400'}`}>
                {config.bypassTrusted ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          
          {/* Account Age Visualization */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Account Age Threshold</span>
              <span>{config.minAccountAge} days old required</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  config.minAccountAge >= 30 ? 'bg-green-500' :
                  config.minAccountAge >= 14 ? 'bg-yellow-500' :
                  config.minAccountAge >= 7 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((config.minAccountAge / 365) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>New (1d)</span>
              <span>Established (365d)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}