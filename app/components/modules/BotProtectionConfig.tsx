'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';

// Types
interface BotProtectionConfig {
  enabled: boolean;
  minAccountAge: number; // hours
  checkUnverified: boolean;
  trustedUsers: string[];
  trustedRoles: string[];
  bypassTrusted: boolean;
  punishmentActions: string[];
  timeoutDuration: number;
  notifyOwner: boolean;
  logChannelId: string | null;
  logActions: boolean;
  debug: boolean;
  whitlistedBots: string[];
  autoKickBots: boolean;
  punishAdders: boolean;
}

interface BotProtectionDocument {
  guildId: string;
  config: BotProtectionConfig;
  lastUpdated: string;
  createdAt: string;
}

interface ModuleConfigProps {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}

// Export module info for auto-loader
export const moduleInfo = {
  id: 'bot-protection',
  name: 'Bot Protection',
  description: 'Protect against suspicious bots and auto-punish bot adders',
  category: 'security',
  //icon: '🤖'
};

const defaultConfig: BotProtectionConfig = {
  enabled: true,
  minAccountAge: 168, // 7 days in hours
  checkUnverified: true,
  trustedUsers: [],
  trustedRoles: [],
  bypassTrusted: true,
  punishmentActions: ['kick_bot', 'timeout_adder'],
  timeoutDuration: 3600, // 1 hour
  notifyOwner: true,
  logChannelId: null,
  logActions: true,
  debug: false,
  whitlistedBots: [],
  autoKickBots: true,
  punishAdders: true
};

const punishmentOptions = [
  { value: 'kick_bot', label: 'Kick Suspicious Bot' },
  { value: 'ban_bot', label: 'Ban Suspicious Bot' },
  { value: 'timeout_adder', label: 'Timeout Bot Adder' },
  { value: 'kick_adder', label: 'Kick Bot Adder' },
  { value: 'ban_adder', label: 'Ban Bot Adder' },
  { value: 'remove_roles_adder', label: 'Remove Roles from Adder' },
  { value: 'notify', label: 'Notify Owner Only' }
];
const validateNumberInput = (value: string, min: number, max?: number): number => {
  const numValue = parseInt(value);
  
  if (isNaN(numValue)) return min;
  if (numValue < min) return min;
  if (max !== undefined && numValue > max) return max;
  
  return numValue;
};
// Then update each number input with proper validation:
export default function BotProtectionConfig({ selectedGuild, onSave }: ModuleConfigProps) {
  const [config, setConfig] = useState<BotProtectionConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { getCached, setCached, invalidate } = useConfigCache();

  // Load config when guild is selected
  useEffect(() => {
    if (selectedGuild) {
      loadConfig();
    }
  }, [selectedGuild]);

  const loadConfig = async () => {
  const cacheKey = `bot-protection-${selectedGuild}`;
    const cached = getCached(cacheKey);
       
    if (cached) {
      setConfig(cached);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/bot-protection?guildId=${selectedGuild}`);
      
      if (response.ok) {
        const data: BotProtectionDocument = await response.json();
        setConfig(data.config);
        setCached(cacheKey, data.config); // CACHE IT

      } else if (response.status === 404) {
        // No config exists, use defaults
        setConfig(defaultConfig);
        setCached(cacheKey, defaultConfig); // CACHE DEFAULT
      } else if (response.status === 429) {
        // limited
        // console.warn('Rate limited, using defaults');
        setConfig(defaultConfig);

      } else {
        throw new Error('Failed to load configuration');
      }
    } catch (error) {
      setConfig(defaultConfig); // Graceful fallback
      // onSave?.(false, 'Failed to load configuration, API IS Down'); // API Is DOWN
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!selectedGuild) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/bot-protection', {
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
// drop cache when saving and update it with new config 
      const cacheKey = `bot-protection-${selectedGuild}`;
        setCached(cacheKey, config);
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

  const updateConfig = (key: keyof BotProtectionConfig, value: any) => {
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

  const addWhitelistedBot = () => {
    const botId = prompt('Enter Bot User ID to whitelist:');
    if (botId && !config.whitlistedBots.includes(botId)) {
      updateConfig('whitlistedBots', [...config.whitlistedBots, botId]);
    }
  };

  const removeWhitelistedBot = (botId: string) => {
    updateConfig('whitlistedBots', config.whitlistedBots.filter(id => id !== botId));
  };

  const togglePunishmentAction = (action: string) => {
    const current = config.punishmentActions;
    if (current.includes(action)) {
      updateConfig('punishmentActions', current.filter(a => a !== action));
    } else {
      updateConfig('punishmentActions', [...current, action]);
    }
  };

  const formatHoursToReadable = (hours: number) => {
    if (hours < 24) return `${hours} hours`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days} days ${remainingHours} hours` : `${days} days`;
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
          <h3 className="text-lg font-semibold text-blue-400">Basic Protection</h3>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Module Enabled</label>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => updateConfig('enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Auto-Kick Suspicious Bots</label>
            <input
              type="checkbox"
              checked={config.autoKickBots}
              onChange={(e) => updateConfig('autoKickBots', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Punish Bot Adders</label>
            <input
              type="checkbox"
              checked={config.punishAdders}
              onChange={(e) => updateConfig('punishAdders', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Check Unverified Bots</label>
            <input
              type="checkbox"
              checked={config.checkUnverified}
              onChange={(e) => updateConfig('checkUnverified', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Minimum Bot Account Age (hours)
              <span className="text-gray-400 text-xs block">
                Currently: {formatHoursToReadable(config.minAccountAge)}
              </span>
            </label>
            <input
              type="number"
              min="1"
              max="8760"
              value={config.minAccountAge}
              onChange={(e) => updateConfig('minAccountAge', parseInt(e.target.value) || 1)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-red-400">Punishment Settings</h3>
          
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
            <div className="space-y-2 max-h-40 overflow-y-auto">
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
            placeholder="Enter Discord Channel ID for logs"
            value={config.logChannelId || ''}
            onChange={(e) => updateConfig('logChannelId', e.target.value || null)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Trusted Users & Roles + Whitelisted Bots */}
      <div className="border-t border-gray-700 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {/* Whitelisted Bots */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-green-400">Whitelisted Bots</h3>
              <button
                onClick={addWhitelistedBot}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Add Bot
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {config.whitlistedBots.length === 0 ? (
                <p className="text-gray-500 text-sm">No bots whitelisted</p>
              ) : (
                config.whitlistedBots.map((botId) => (
                  <div key={botId} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                    <span className="text-sm font-mono">{botId}</span>
                    <button
                      onClick={() => removeWhitelistedBot(botId)}
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
              <span className="ml-2 text-yellow-400">{formatHoursToReadable(config.minAccountAge)}</span>
            </div>
            <div>
              <span className="text-gray-400">Auto-Kick:</span>
              <span className={`ml-2 ${config.autoKickBots ? 'text-green-400' : 'text-red-400'}`}>
                {config.autoKickBots ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Punish Adders:</span>
              <span className={`ml-2 ${config.punishAdders ? 'text-red-400' : 'text-gray-400'}`}>
                {config.punishAdders ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-800">
            <span className="text-gray-400">Active Punishments:</span>
            <span className="ml-2 text-orange-400">
              {config.punishmentActions.length > 0 ? config.punishmentActions.join(', ') : 'None'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}