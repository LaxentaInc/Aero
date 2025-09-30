'use client';

import { useState, useEffect } from 'react';

// Types
interface AntiNukeConfig {
  enabled: boolean;
  antiNukeEnabled: boolean;
  channelDeleteThreshold: number;
  roleDeleteThreshold: number;
  webhookCreateThreshold: number;
  emojiDeleteThreshold: number;
  stickerDeleteThreshold: number;
  timeWindow: number;
  trustedUsers: string[];
  trustedRoles: string[];
  bypassTrusted: boolean;
  punishmentActions: string[];
  timeoutDuration: number;
  enableRollback: boolean;
  rollbackChannels: boolean;
  rollbackRoles: boolean;
  rollbackEmojis: boolean;
  notifyOwner: boolean;
  logChannelId: string | null;
  logActions: boolean;
  antiWebhookSpam: boolean;
  antiSelfBot: boolean;
  maxWebhooksPerChannel: number;
  debug: boolean;
}

interface AntiNukeDocument {
  guildId: string;
  config: AntiNukeConfig;
  lastUpdated: string;
  createdAt: string;
}

interface ModuleConfigProps {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}

// Export module info
export const moduleInfo = {
  id: 'anti-nuke',
  name: 'Anti-Nuke Protection',
  description: 'Protect against mass channel/role deletion, webhook spam, and server nuking',
  category: 'security',
};

const defaultConfig: AntiNukeConfig = {
  enabled: true,
  antiNukeEnabled: true,
  channelDeleteThreshold: 3,
  roleDeleteThreshold: 3,
  webhookCreateThreshold: 3,
  emojiDeleteThreshold: 5,
  stickerDeleteThreshold: 3,
  timeWindow: 30,
  trustedUsers: [],
  trustedRoles: [],
  bypassTrusted: true,
  punishmentActions: ['remove_roles', 'timeout', 'notify'],
  timeoutDuration: 1800,
  enableRollback: true,
  rollbackChannels: true,
  rollbackRoles: true,
  rollbackEmojis: true,
  notifyOwner: true,
  logChannelId: null,
  logActions: true,
  antiWebhookSpam: true,
  antiSelfBot: true,
  maxWebhooksPerChannel: 5,
  debug: false
};

const punishmentOptions = [
  { value: 'remove_roles', label: 'Remove Roles' },
  { value: 'timeout', label: 'Timeout Member' },
  { value: 'kick', label: 'Kick Member' },
  { value: 'ban', label: 'Ban Member' },
  { value: 'notify', label: 'Notify Owner' }
];

export default function AntiNukeConfig({ selectedGuild, onSave }: ModuleConfigProps) {
  const [config, setConfig] = useState<AntiNukeConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedGuild) {
      loadConfig();
    }
  }, [selectedGuild]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/antinuke?guildId=${selectedGuild}`);
      
      if (response.ok) {
        const data: AntiNukeDocument = await response.json();
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
      const response = await fetch('/api/antinuke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: selectedGuild, config }),
      });

      if (response.ok) {
        onSave?.(true, 'Anti-Nuke configuration saved successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      onSave?.(false, 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof AntiNukeConfig, value: any) => {
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
          <h3 className="text-lg font-semibold text-red-400">Core Protection</h3>
          
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
            <label className="text-sm font-medium">Anti-Nuke Protection</label>
            <input
              type="checkbox"
              checked={config.antiNukeEnabled}
              onChange={(e) => updateConfig('antiNukeEnabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Time Window (seconds)</label>
            <input
              type="number"
              min="10"
              max="300"
              value={config.timeWindow}
              onChange={(e) => updateConfig('timeWindow', parseInt(e.target.value) || 10)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Actions within this window trigger protection</p>
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
            <p className="text-xs text-gray-500 mt-1">How long to timeout violators</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-orange-400">Action Thresholds</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Channel Deletions</label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.channelDeleteThreshold}
              onChange={(e) => updateConfig('channelDeleteThreshold', parseInt(e.target.value) || 1)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role Deletions</label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.roleDeleteThreshold}
              onChange={(e) => updateConfig('roleDeleteThreshold', parseInt(e.target.value) || 1)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Webhook Creations</label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.webhookCreateThreshold}
              onChange={(e) => updateConfig('webhookCreateThreshold', parseInt(e.target.value) || 1)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Emoji Deletes</label>
              <input
                type="number"
                min="1"
                max="30"
                value={config.emojiDeleteThreshold}
                onChange={(e) => updateConfig('emojiDeleteThreshold', parseInt(e.target.value) || 1)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sticker Deletes</label>
              <input
                type="number"
                min="1"
                max="30"
                value={config.stickerDeleteThreshold}
                onChange={(e) => updateConfig('stickerDeleteThreshold', parseInt(e.target.value) || 1)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Punishment Actions */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4">Punishment Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {punishmentOptions.map((option) => (
            <div key={option.value} className="flex items-center bg-gray-700 rounded px-3 py-2">
              <input
                type="checkbox"
                id={`punishment-${option.value}`}
                checked={config.punishmentActions.includes(option.value)}
                onChange={() => togglePunishmentAction(option.value)}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 mr-2"
              />
              <label htmlFor={`punishment-${option.value}`} className="text-sm cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Rollback Settings */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-green-400 mb-4">Rollback & Recovery</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Enable Rollback</label>
            <input
              type="checkbox"
              checked={config.enableRollback}
              onChange={(e) => updateConfig('enableRollback', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Rollback Channels</label>
            <input
              type="checkbox"
              checked={config.rollbackChannels}
              onChange={(e) => updateConfig('rollbackChannels', e.target.checked)}
              disabled={!config.enableRollback}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Rollback Roles</label>
            <input
              type="checkbox"
              checked={config.rollbackRoles}
              onChange={(e) => updateConfig('rollbackRoles', e.target.checked)}
              disabled={!config.enableRollback}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Rollback Emojis</label>
            <input
              type="checkbox"
              checked={config.rollbackEmojis}
              onChange={(e) => updateConfig('rollbackEmojis', e.target.checked)}
              disabled={!config.enableRollback}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Advanced Protection */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Advanced Protection</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Anti-Webhook Spam</label>
            <input
              type="checkbox"
              checked={config.antiWebhookSpam}
              onChange={(e) => updateConfig('antiWebhookSpam', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Anti-SelfBot Detection</label>
            <input
              type="checkbox"
              checked={config.antiSelfBot}
              onChange={(e) => updateConfig('antiSelfBot', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max Webhooks/Channel</label>
            <input
              type="number"
              min="1"
              max="15"
              value={config.maxWebhooksPerChannel}
              onChange={(e) => updateConfig('maxWebhooksPerChannel', parseInt(e.target.value) || 1)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Logging & Notifications */}
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

      {/* Trusted Users & Roles */}
      <div className="border-t border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-yellow-400">Trusted Bypass</h3>
          <div className="flex items-center">
            <label className="text-sm font-medium mr-2">Bypass Trusted</label>
            <input
              type="checkbox"
              checked={config.bypassTrusted}
              onChange={(e) => updateConfig('bypassTrusted', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trusted Users */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-300">Trusted Users</h4>
              <button
                onClick={addTrustedUser}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Add User
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {config.trustedUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">No trusted users</p>
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
              <h4 className="text-sm font-semibold text-gray-300">Trusted Roles</h4>
              <button
                onClick={addTrustedRole}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Add Role
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {config.trustedRoles.length === 0 ? (
                <p className="text-gray-500 text-sm">No trusted roles</p>
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
        <h3 className="text-lg font-semibold text-gray-400 mb-3">Protection Summary</h3>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-400">Status:</span>
              <span className={`ml-2 ${config.enabled ? 'text-green-400' : 'text-red-400'}`}>
                {config.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Channel Limit:</span>
              <span className="ml-2 text-yellow-400">{config.channelDeleteThreshold}</span>
            </div>
            <div>
              <span className="text-gray-400">Role Limit:</span>
              <span className="ml-2 text-yellow-400">{config.roleDeleteThreshold}</span>
            </div>
            <div>
              <span className="text-gray-400">Rollback:</span>
              <span className={`ml-2 ${config.enableRollback ? 'text-green-400' : 'text-gray-500'}`}>
                {config.enableRollback ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}