'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';

// Types
interface AntiNukeConfig {
  enabled: boolean;
  // antiNukeEnabled: boolean;
  channelDeleteThreshold: number;
  roleDeleteThreshold: number;
  webhookCreateThreshold: number;
  emojiDeleteThreshold: number;
  stickerDeleteThreshold: number;
  banThreshold: number;
  kickThreshold: number;
  timeWindow: number;
  burstWindow: number;
  trustedUsers: string[];
  trustedRoles: string[];
  bypassTrusted: boolean;
  monitorBots: boolean;
  botThresholdMultiplier: number;
  punishmentActions: string[];
  timeoutDuration: number;
  enableRollback: boolean;
  rollbackChannels: boolean;
  rollbackRoles: boolean;
  rollbackEmojis: boolean;
  maxChannelBackups: number;
  maxRoleBackups: number;
  maxEmojiBackups: number;
  maxStickerBackups: number;
  backupRetentionHours: number;
  notifyOwner: boolean;
  progressiveAlerts: boolean;
  logChannelId: string | null;
  logActions: boolean;
  antiWebhookSpam: boolean;
  antiSelfBot: boolean;
  maxWebhooksPerChannel: number;
  auditLogCacheDuration: number;
  eventBatchWindow: number;
  circuitBreakerThreshold: number;
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
  description: 'Advanced protection against mass destructive actions, server raids, and automated attacks',
  category: 'security',
};

const defaultConfig: AntiNukeConfig = {
  enabled: true,
  channelDeleteThreshold: 3,
  roleDeleteThreshold: 3,
  webhookCreateThreshold: 3,
  emojiDeleteThreshold: 5,
  stickerDeleteThreshold: 3,
  banThreshold: 3,
  kickThreshold: 5,
  timeWindow: 30,
  burstWindow: 5,
  trustedUsers: [],
  trustedRoles: [],
  bypassTrusted: true,
  monitorBots: true,
  botThresholdMultiplier: 0.5,
  punishmentActions: ['remove_roles', 'timeout', 'notify'],
  timeoutDuration: 1800,
  enableRollback: true,
  rollbackChannels: true,
  rollbackRoles: true,
  rollbackEmojis: true,
  maxChannelBackups: 20,
  maxRoleBackups: 50,
  maxEmojiBackups: 100,
  maxStickerBackups: 100,
  backupRetentionHours: 24,
  notifyOwner: true,
  progressiveAlerts: true,
  logChannelId: null,
  logActions: true,
  antiWebhookSpam: true,
  antiSelfBot: true,
  maxWebhooksPerChannel: 5,
  auditLogCacheDuration: 2000,
  eventBatchWindow: 300,
  circuitBreakerThreshold: 3,
  debug: false
};

const punishmentOptions = [
  { value: 'remove_roles', label: 'Remove Dangerous Roles', description: 'Strips all roles with admin/destructive permissions' },
  { value: 'timeout', label: 'Timeout', description: 'Temporarily mute the violator' },
  { value: 'kick', label: 'Kick from Server', description: 'Immediately remove from server (can rejoin)' },
  { value: 'ban', label: 'Ban from Server', description: 'Permanent removal (cannot rejoin)' },
  { value: 'notify', label: 'Notify Owner', description: 'Send DM to server owner with details' }
];

// Tooltip component
function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block ml-1">
      <svg
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="w-4 h-4 text-gray-400 hover:text-gray-300 cursor-help inline"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {show && (
        <div className="absolute z-50 w-64 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-xl border border-gray-700 left-6 top-0 transform -translate-y-1/2">
          {text}
        </div>
      )}
    </div>
  );
}

export default function AntiNukeConfig({ selectedGuild, onSave }: ModuleConfigProps) {
  const [config, setConfig] = useState<AntiNukeConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { getCached, setCached, invalidate: _invalidate } = useConfigCache(); //uh again, invalidate is unused for now xd

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
      return; // no api call
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/antinuke?guildId=${selectedGuild}`);
      
      if (response.ok) {
        const data: AntiNukeDocument = await response.json();
        setConfig(data.config);
        setCached(cacheKey, data.config)
      } else if (response.status === 404) {
        setConfig(defaultConfig);
        setCached(cacheKey, defaultConfig); // c DEFAULT
      } else if (response.status === 429) {
        setConfig(defaultConfig);


      } else {
        throw new Error('Failed to load configuration');
      }
    } catch (error) {
      setConfig(defaultConfig); // Graceful fallback

      onSave?.(false, 'Failed to load configuration, API Is DOWN');
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

        const cacheKey = `account-age-${selectedGuild}`;
        setCached(cacheKey, config); // Update cache with new config
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
      {/* Module Description */}
      <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-800/30 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <svg className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Anti-Nuke Protection System</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              This module provides comprehensive protection against server raids, mass destructive actions, and automated attacks. 
              It monitors suspicious patterns like rapid channel/role deletions, webhook spam, and mass bans/kicks. When violations 
              are detected, it automatically punishes the attacker and attempts to recover deleted resources. Features include 
              <span className="text-yellow-400 font-semibold"> burst detection</span>, 
              <span className="text-blue-400 font-semibold"> circuit breakers</span> for emergency lockdowns, 
              <span className="text-green-400 font-semibold"> progressive warnings</span>, and 
              <span className="text-purple-400 font-semibold"> intelligent rollback</span> with priority-based recovery.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-red-400 flex items-center">
            Core Protection
          </h3>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center">
              Module Enabled
              <Tooltip text="Master switch - disables all anti-nuke protections when off" />
            </label>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => updateConfig('enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          {/* <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center">
              Anti-Nuke Active
              <Tooltip text="When enabled, actively monitors and punishes destructive actions. Disable temporarily to allow legitimate mass changes." />
            </label>
            <input
              type="checkbox"
              checked={config.antiNukeEnabled}
              onChange={(e) => updateConfig('antiNukeEnabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div> */}

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center">
              Detection Time Window
              <Tooltip text="Actions within this time period are counted together. For example, deleting 3 channels within 30 seconds triggers protection." />
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="10"
                max="300"
                value={config.timeWindow}
                onChange={(e) => updateConfig('timeWindow', parseInt(e.target.value) || 10)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-400">seconds</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center">
              Burst Detection Window
              <Tooltip text="CRITICAL: Detects rapid-fire attacks. If 3+ actions happen within this window, emergency circuit breaker activates immediately." />
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="10"
                value={config.burstWindow}
                onChange={(e) => updateConfig('burstWindow', parseInt(e.target.value) || 1)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="text-sm text-gray-400">seconds</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center">
              Circuit Breaker Threshold
              <Tooltip text="Emergency lockdown trigger. If this many actions occur within 1 second, immediately strip all dangerous permissions before checking other thresholds." />
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={config.circuitBreakerThreshold}
              onChange={(e) => updateConfig('circuitBreakerThreshold', parseInt(e.target.value) || 2)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Timeout Duration</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="60"
                max="2419200"
                value={config.timeoutDuration}
                onChange={(e) => updateConfig('timeoutDuration', parseInt(e.target.value) || 60)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-400">{Math.floor(config.timeoutDuration / 60)} min</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-orange-400">Destruction Thresholds</h3>
          <p className="text-xs text-gray-400">Maximum actions allowed within the time window before punishment triggers</p>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Channels Deleted</label>
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
              <label className="block text-sm font-medium mb-1">Roles Deleted</label>
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
              <label className="block text-sm font-medium mb-1 flex items-center">
                Members Banned
                <Tooltip text="Prevents ban raids where attackers mass-ban legitimate members" />
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={config.banThreshold}
                onChange={(e) => updateConfig('banThreshold', parseInt(e.target.value) || 1)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Members Kicked</label>
              <input
                type="number"
                min="1"
                max="30"
                value={config.kickThreshold}
                onChange={(e) => updateConfig('kickThreshold', parseInt(e.target.value) || 1)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Webhooks Created</label>
              <input
                type="number"
                min="1"
                max="20"
                value={config.webhookCreateThreshold}
                onChange={(e) => updateConfig('webhookCreateThreshold', parseInt(e.target.value) || 1)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Emojis Deleted</label>
              <input
                type="number"
                min="1"
                max="50"
                value={config.emojiDeleteThreshold}
                onChange={(e) => updateConfig('emojiDeleteThreshold', parseInt(e.target.value) || 1)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stickers Deleted</label>
            <input
              type="number"
              min="1"
              max="50"
              value={config.stickerDeleteThreshold}
              onChange={(e) => updateConfig('stickerDeleteThreshold', parseInt(e.target.value) || 1)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bot Monitoring */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center">
          Bot Account Monitoring
          <Tooltip text="Monitors bot accounts separately. Compromised bots are extremely dangerous as they can bypass rate limits and act instantly." />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center">
              Monitor Bot Actions
              <Tooltip text="When enabled, bot accounts are also tracked. Disable only if you have trusted bots that perform mass operations." />
            </label>
            <input
              type="checkbox"
              checked={config.monitorBots}
              onChange={(e) => updateConfig('monitorBots', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center">
              Bot Threshold Multiplier
              <Tooltip text="Bots get stricter limits. 0.5 means bots can only do 50% of what humans can before triggering protection. Lower = stricter." />
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0.1"
                max="1"
                step="0.1"
                value={config.botThresholdMultiplier}
                onChange={(e) => updateConfig('botThresholdMultiplier', parseFloat(e.target.value) || 0.1)}
                disabled={!config.monitorBots}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-400">{Math.floor(config.botThresholdMultiplier * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Punishment Actions */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
          Automatic Punishments
          <Tooltip text="Actions taken automatically when thresholds are exceeded. Multiple can be selected and will execute in order." />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {punishmentOptions.map((option) => (
            <div key={option.value} className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id={`punishment-${option.value}`}
                  checked={config.punishmentActions.includes(option.value)}
                  onChange={() => togglePunishmentAction(option.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 mt-0.5 mr-3 flex-shrink-0"
                />
                <div>
                  <label htmlFor={`punishment-${option.value}`} className="text-sm font-medium cursor-pointer block">
                    {option.label}
                  </label>
                  <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rollback System */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
          Automatic Rollback & Recovery
          <Tooltip text="Automatically recreates deleted channels, roles, and emojis using cached backups. Uses priority system to recover most important items first." />
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center">
              Enable Rollback System
              <Tooltip text="Master switch for all recovery features. When off, nothing will be automatically recovered." />
            </label>
            <input
              type="checkbox"
              checked={config.enableRollback}
              onChange={(e) => updateConfig('enableRollback', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Recover Channels</label>
              <input
                type="checkbox"
                checked={config.rollbackChannels}
                onChange={(e) => updateConfig('rollbackChannels', e.target.checked)}
                disabled={!config.enableRollback}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Recover Roles</label>
              <input
                type="checkbox"
                checked={config.rollbackRoles}
                onChange={(e) => updateConfig('rollbackRoles', e.target.checked)}
                disabled={!config.enableRollback}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Recover Emojis</label>
              <input
                type="checkbox"
                checked={config.rollbackEmojis}
                onChange={(e) => updateConfig('rollbackEmojis', e.target.checked)}
                disabled={!config.enableRollback}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                Backup Age Limit
                <Tooltip text="How long to keep backups. Older backups are automatically deleted to save memory." />
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={config.backupRetentionHours}
                  onChange={(e) => updateConfig('backupRetentionHours', parseInt(e.target.value) || 1)}
                  disabled={!config.enableRollback}
                  className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-xs text-gray-400">hours</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
              Backup Storage Limits
              <Tooltip text="Maximum items to keep in backup cache. Limits memory usage while keeping most important items backed up." />
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Channels</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={config.maxChannelBackups}
                  onChange={(e) => updateConfig('maxChannelBackups', parseInt(e.target.value) || 5)}
                  disabled={!config.enableRollback}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Roles</label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={config.maxRoleBackups}
                  onChange={(e) => updateConfig('maxRoleBackups', parseInt(e.target.value) || 10)}
                  disabled={!config.enableRollback}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Emojis</label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={config.maxEmojiBackups}
                  onChange={(e) => updateConfig('maxEmojiBackups', parseInt(e.target.value) || 20)}
                  disabled={!config.enableRollback}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Stickers</label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={config.maxStickerBackups}
                  onChange={(e) => updateConfig('maxStickerBackups', parseInt(e.target.value) || 20)}
                  disabled={!config.enableRollback}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Protection */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Advanced Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center">
              Progressive Alerts
              <Tooltip text="Sends a warning to the owner when someone is 1 action away from triggering punishment. Helps catch threats early." />
            </label>
            <input
              type="checkbox"
              checked={config.progressiveAlerts}
              onChange={(e) => updateConfig('progressiveAlerts', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center">
              Anti-Webhook Spam
              <Tooltip text="Limits webhooks per channel to prevent spam attacks where attackers create hundreds of webhooks." />
            </label>
            <input
              type="checkbox"
              checked={config.antiWebhookSpam}
              onChange={(e) => updateConfig('antiWebhookSpam', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center">
              Anti-SelfBot Detection
              <Tooltip text="Ignores actions by this bot itself to prevent false positives when the bot is legitimately managing the server." />
            </label>
            <input
              type="checkbox"
              checked={config.antiSelfBot}
              onChange={(e) => updateConfig('antiSelfBot', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max Webhooks per Channel</label>
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

      {/* Performance Tuning */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center">
          Performance Tuning
          <Tooltip text="Advanced settings that control how the system processes events. Only change these if you understand their impact." />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center">
              Audit Log Cache Duration
              <Tooltip text="How long to cache Discord audit logs (in milliseconds). Higher = fewer API calls but slightly stale data. 2000ms is optimal." />
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="500"
                max="10000"
                step="500"
                value={config.auditLogCacheDuration}
                onChange={(e) => updateConfig('auditLogCacheDuration', parseInt(e.target.value) || 500)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-400">ms</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center">
              Event Batch Window
              <Tooltip text="Groups events within this window for efficient processing. Lower = more responsive but higher CPU usage." />
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="100"
                max="1000"
                step="50"
                value={config.eventBatchWindow}
                onChange={(e) => updateConfig('eventBatchWindow', parseInt(e.target.value) || 100)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-400">ms</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center">
              Debug Mode
              <Tooltip text="Enables detailed console logging for troubleshooting. Disable in production as it creates lots of log spam." />
            </label>
            <input
              type="checkbox"
              checked={config.debug}
              onChange={(e) => updateConfig('debug', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Logging & Notifications */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-purple-400 mb-4">Logging & Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center">
              Notify Server Owner
              <Tooltip text="Sends detailed DM to server owner when violations occur, including what failed and why." />
            </label>
            <input
              type="checkbox"
              checked={config.notifyOwner}
              onChange={(e) => updateConfig('notifyOwner', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Log to Channel</label>
            <input
              type="checkbox"
              checked={config.logActions}
              onChange={(e) => updateConfig('logActions', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 flex items-center">
            Log Channel ID (optional)
            <Tooltip text="Specific channel for anti-nuke logs. Leave empty to use system channel. Right-click channel > Copy ID to get this." />
          </label>
          <input
            type="text"
            placeholder="e.g. 1234567890123456789"
            value={config.logChannelId || ''}
            onChange={(e) => updateConfig('logChannelId', e.target.value || null)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Trusted Users & Roles */}
      <div className="border-t border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-yellow-400 flex items-center">
            Trusted Bypass List
            <Tooltip text="Users/roles on this list are ignored by anti-nuke. Use carefully - if compromised, they can destroy your server!" />
          </h3>
          <div className="flex items-center">
            <label className="text-sm font-medium mr-2">Enable Bypass</label>
            <input
              type="checkbox"
              checked={config.bypassTrusted}
              onChange={(e) => updateConfig('bypassTrusted', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 mb-4">
          <p className="text-xs text-yellow-200">
            ⚠️ Warning: Trusted users can bypass ALL protections. Only add administrators you completely trust. 
            Server owners are automatically trusted and cannot be punished.
          </p>
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
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {config.trustedUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">No trusted users added</p>
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
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {config.trustedRoles.length === 0 ? (
                <p className="text-gray-500 text-sm">No trusted roles added</p>
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
          {saving ? 'Saving Configuration...' : 'Save Anti-Nuke Configuration'}
        </button>
      </div>

      {/* Configuration Summary */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-400 mb-3">Current Protection Status</h3>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">System Status:</span>
              <span className={`ml-2 font-semibold ${config.enabled ? 'text-green-400' : 'text-red-400'}`}>
                {config.enabled ? '🛡️ Protected' : '⚠️ Disabled'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Channel Safety:</span>
              <span className="ml-2 text-yellow-400 font-semibold">{config.channelDeleteThreshold} max</span>
            </div>
            <div>
              <span className="text-gray-400">Role Safety:</span>
              <span className="ml-2 text-yellow-400 font-semibold">{config.roleDeleteThreshold} max</span>
            </div>
            <div>
              <span className="text-gray-400">Ban Protection:</span>
              <span className="ml-2 text-yellow-400 font-semibold">{config.banThreshold} max</span>
            </div>
            <div>
              <span className="text-gray-400">Auto-Recovery:</span>
              <span className={`ml-2 font-semibold ${config.enableRollback ? 'text-green-400' : 'text-gray-500'}`}>
                {config.enableRollback ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Bot Monitoring:</span>
              <span className={`ml-2 font-semibold ${config.monitorBots ? 'text-cyan-400' : 'text-gray-500'}`}>
                {config.monitorBots ? `${Math.floor(config.botThresholdMultiplier * 100)}% strict` : 'Off'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Circuit Breaker:</span>
              <span className="ml-2 text-red-400 font-semibold">{config.circuitBreakerThreshold} in 1s</span>
            </div>
            <div>
              <span className="text-gray-400">Punishments:</span>
              <span className="ml-2 text-purple-400 font-semibold">{config.punishmentActions.length} active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}