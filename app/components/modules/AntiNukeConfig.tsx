'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';
import { Info, Save, Check, X, Loader2, Shield, Users, Settings, Bell, FileText, AlertTriangle, Zap, RotateCcw, Cpu } from 'lucide-react';

// Types
interface AntiNukeConfig {
  enabled: boolean;
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
  { value: 'remove_roles', label: 'Remove Dangerous Roles', description: 'Strips all roles with admin/destructive permissions', tooltip: 'Immediately removes all dangerous permissions from the attacker' },
  { value: 'timeout', label: 'Timeout', description: 'Temporarily mute the violator', tooltip: 'Prevents the user from interacting while investigation occurs' },
  { value: 'kick', label: 'Kick from Server', description: 'Immediately remove from server (can rejoin)', tooltip: 'Removes the user but allows them to rejoin with an invite' },
  { value: 'ban', label: 'Ban from Server', description: 'Permanent removal (cannot rejoin)', tooltip: 'Permanently bans the user from the server' },
  { value: 'notify', label: 'Notify Owner', description: 'Send DM to server owner with details', tooltip: 'Sends immediate alert to server owner with full details' }
];

const validateNumberInput = (value: string, min: number, max?: number): number => {
  const numValue = parseInt(value);
  
  if (isNaN(numValue)) return min;
  if (numValue < min) return min;
  if (max !== undefined && numValue > max) return max;
  
  return numValue;
};

const validateFloatInput = (value: string, min: number, max: number): number => {
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) return min;
  if (numValue < min) return min;
  if (numValue > max) return max;
  
  return parseFloat(numValue.toFixed(1));
};

const Tooltip = ({ text, children }: { text: string; children?: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children || <Info className="w-4 h-4 text-gray-500" />}
      </div>
      {show && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-700 whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 duration-200">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};


const Toggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) => {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-blue-600' : 'bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

const Checkbox = ({ checked, onChange, disabled, label }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; label?: string }) => {
  return (
    <label className="flex items-center cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
          checked 
            ? 'bg-blue-600 border-blue-600' 
            : 'bg-gray-700 border-gray-600 group-hover:border-gray-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
      </div>
      {label && <span className="ml-2 text-sm">{label}</span>}
    </label>
  );
};

export default function AntiNukeConfig({ selectedGuild, onSave }: ModuleConfigProps) {
  const [config, setConfig] = useState<AntiNukeConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);
  const { getCached, setCached, invalidate: _invalidate } = useConfigCache();

  useEffect(() => {
    if (selectedGuild) {
      loadConfig();
    }
  }, [selectedGuild]);

  const loadConfig = async () => {
    const cacheKey = `anti-nuke-${selectedGuild}`;
    const cached = getCached(cacheKey);
    
    if (cached) {
      setConfig(cached);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/antinuke?guildId=${selectedGuild}`);
      
      if (response.ok) {
        const data: AntiNukeDocument = await response.json();
        setConfig(data.config);
        setCached(cacheKey, data.config);
      } else if (response.status === 404) {
        setConfig(defaultConfig);
        setCached(cacheKey, defaultConfig);
      } else {
        setConfig(defaultConfig);
      }
    } catch (error) {
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!selectedGuild) return;
    
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTime;
    const cooldown = 15000;
    
    if (timeSinceLastSave < cooldown) {
      onSave?.(false, `Please wait ${Math.ceil((cooldown - timeSinceLastSave) / 1000)} seconds before saving again`);
      return;
    }
    
    setSaving(true);
    setSaveStatus('saving');
    
    try {
      const response = await fetch('/api/antinuke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: selectedGuild, config }),
      });

      if (response.ok) {
        const cacheKey = `anti-nuke-${selectedGuild}`;
        setCached(cacheKey, config);
        setSaveStatus('success');
        setLastSaveTime(now);
        onSave?.(true, 'Anti-Nuke configuration saved successfully!');
        
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      setSaveStatus('error');
      onSave?.(false, 'Failed to save configuration');
      
      setTimeout(() => setSaveStatus('idle'), 2000);
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

  const isFormDisabled = loading || saving;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
          <div className="text-gray-400">Loading anti-nuke configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-800/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-600/20 rounded-lg">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Anti-Nuke Protection</h2>
            <p className="text-gray-400 text-sm">Advanced protection against mass destructive actions, server raids, and automated attacks</p>
          </div>
        </div>
      </div>

      {/* Module Status */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${config.enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
            <span className="font-medium text-white">Module Status</span>
            <Tooltip text="Enable or disable the entire anti-nuke protection system">
              <Info className="w-4 h-4 text-gray-500" />
            </Tooltip>
          </div>
          <Toggle 
            checked={config.enabled} 
            onChange={(val) => updateConfig('enabled', val)}
            disabled={isFormDisabled}
          />
        </div>
      </div>

      {/* Core Protection Settings */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Core Protection Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  Detection Time Window (seconds)
                  <Tooltip text="Actions within this time period are counted together. For example, deleting 3 channels within 30 seconds triggers protection." />
                </div>
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={config.timeWindow}
                onChange={(e) => updateConfig('timeWindow', validateNumberInput(e.target.value, 10, 300))}
                onBlur={(e) => {
                  const validated = validateNumberInput(e.target.value, 10, 300);
                  if (validated !== config.timeWindow) {
                    updateConfig('timeWindow', validated);
                  }
                }}
                disabled={isFormDisabled}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Min: 10s, Max: 300s</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  Burst Detection Window (seconds)
                  <Tooltip text="CRITICAL: Detects rapid-fire attacks. If 3+ actions happen within this window, emergency circuit breaker activates immediately." />
                </div>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.burstWindow}
                onChange={(e) => updateConfig('burstWindow', validateNumberInput(e.target.value, 1, 10))}
                onBlur={(e) => {
                  const validated = validateNumberInput(e.target.value, 1, 10);
                  if (validated !== config.burstWindow) {
                    updateConfig('burstWindow', validated);
                  }
                }}
                disabled={isFormDisabled}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Min: 1s, Max: 10s</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  Circuit Breaker Threshold
                  <Tooltip text="Emergency lockdown trigger. If this many actions occur within 1 second, immediately strip all dangerous permissions before checking other thresholds." />
                </div>
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={config.circuitBreakerThreshold}
                onChange={(e) => updateConfig('circuitBreakerThreshold', validateNumberInput(e.target.value, 2, 10))}
                onBlur={(e) => {
                  const validated = validateNumberInput(e.target.value, 2, 10);
                  if (validated !== config.circuitBreakerThreshold) {
                    updateConfig('circuitBreakerThreshold', validated);
                  }
                }}
                disabled={isFormDisabled}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Min: 2, Max: 10</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  Timeout Duration (seconds)
                  <Tooltip text="How long to timeout violators when timeout punishment is triggered" />
                </div>
              </label>
              <input
                type="number"
                min="60"
                max="2419200"
                value={config.timeoutDuration}
                onChange={(e) => updateConfig('timeoutDuration', validateNumberInput(e.target.value, 60, 2419200))}
                onBlur={(e) => {
                  const validated = validateNumberInput(e.target.value, 60, 2419200);
                  if (validated !== config.timeoutDuration) {
                    updateConfig('timeoutDuration', validated);
                  }
                }}
                disabled={isFormDisabled}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Min: 60s, Max: 28 days (2419200s) | Current: {Math.floor(config.timeoutDuration / 60)} minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Destruction Thresholds */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Destruction Thresholds</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">Maximum actions allowed within the time window before punishment triggers</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Channels Deleted</label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.channelDeleteThreshold}
              onChange={(e) => updateConfig('channelDeleteThreshold', validateNumberInput(e.target.value, 1, 20))}
              onBlur={(e) => {
                const validated = validateNumberInput(e.target.value, 1, 20);
                if (validated !== config.channelDeleteThreshold) {
                  updateConfig('channelDeleteThreshold', validated);
                }
              }}
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Roles Deleted</label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.roleDeleteThreshold}
              onChange={(e) => updateConfig('roleDeleteThreshold', validateNumberInput(e.target.value, 1, 20))}
              onBlur={(e) => {
                const validated = validateNumberInput(e.target.value, 1, 20);
                if (validated !== config.roleDeleteThreshold) {
                  updateConfig('roleDeleteThreshold', validated);
                }
              }}
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                Members Banned
                <Tooltip text="Prevents ban raids where attackers mass-ban legitimate members" />
              </div>
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.banThreshold}
              onChange={(e) => updateConfig('banThreshold', validateNumberInput(e.target.value, 1, 20))}
              onBlur={(e) => {
                const validated = validateNumberInput(e.target.value, 1, 20);
                if (validated !== config.banThreshold) {
                  updateConfig('banThreshold', validated);
                }
              }}
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Members Kicked</label>
            <input
              type="number"
              min="1"
              max="30"
              value={config.kickThreshold}
              onChange={(e) => updateConfig('kickThreshold', validateNumberInput(e.target.value, 1, 30))}
              onBlur={(e) => {
                const validated = validateNumberInput(e.target.value, 1, 30);
                if (validated !== config.kickThreshold) {
                  updateConfig('kickThreshold', validated);
                }
              }}
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Webhooks Created</label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.webhookCreateThreshold}
              onChange={(e) => updateConfig('webhookCreateThreshold', validateNumberInput(e.target.value, 1, 20))}
              onBlur={(e) => {
                const validated = validateNumberInput(e.target.value, 1, 20);
                if (validated !== config.webhookCreateThreshold) {
                  updateConfig('webhookCreateThreshold', validated);
                }
              }}
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Emojis Deleted</label>
            <input
              type="number"
              min="1"
              max="50"
              value={config.emojiDeleteThreshold}
              onChange={(e) => updateConfig('emojiDeleteThreshold', validateNumberInput(e.target.value, 1, 50))}
              onBlur={(e) => {
                const validated = validateNumberInput(e.target.value, 1, 50);
                if (validated !== config.emojiDeleteThreshold) {
                  updateConfig('emojiDeleteThreshold', validated);
                }
              }}
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Stickers Deleted</label>
            <input
              type="number"
              min="1"
              max="50"
              value={config.stickerDeleteThreshold}
              onChange={(e) => updateConfig('stickerDeleteThreshold', validateNumberInput(e.target.value, 1, 50))}
              onBlur={(e) => {
                const validated = validateNumberInput(e.target.value, 1, 50);
                if (validated !== config.stickerDeleteThreshold) {
                  updateConfig('stickerDeleteThreshold', validated);
                }
              }}
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Bot Monitoring */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Bot Account Monitoring</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Monitor Bot Actions</span>
              <Tooltip text="When enabled, bot accounts are also tracked. Disable only if you have trusted bots that perform mass operations." />
            </div>
            <Toggle 
              checked={config.monitorBots} 
              onChange={(val) => updateConfig('monitorBots', val)}
              disabled={isFormDisabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                Bot Threshold Multiplier
                <Tooltip text="Bots get stricter limits. 0.5 means bots can only do 50% of what humans can before triggering protection. Lower = stricter." />
              </div>
            </label>
            <input
              type="number"
              min="0.1"
              max="1"
              step="0.1"
              value={config.botThresholdMultiplier}
              onChange={(e) => updateConfig('botThresholdMultiplier', validateFloatInput(e.target.value, 0.1, 1))}
              onBlur={(e) => {
                const validated = validateFloatInput(e.target.value, 0.1, 1);
                if (validated !== config.botThresholdMultiplier) {
                  updateConfig('botThresholdMultiplier', validated);
                }
              }}
              disabled={isFormDisabled || !config.monitorBots}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Current: {Math.floor(config.botThresholdMultiplier * 100)}% of normal limits</p>
          </div>
        </div>
      </div>

      {/* Punishment Actions */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Automatic Punishments</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">Actions taken automatically when thresholds are exceeded. Multiple can be selected and will execute in order.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {punishmentOptions.map((option) => (
            <div key={option.value} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={config.punishmentActions.includes(option.value)}
                    onChange={() => togglePunishmentAction(option.value)}
                    disabled={isFormDisabled}
                  />
                  <span className="text-sm font-medium text-gray-200">{option.label}</span>
                </div>
                <Tooltip text={option.tooltip}>
                  <Info className="w-4 h-4 text-gray-500" />
                </Tooltip>
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-8">{option.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rollback System */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <RotateCcw className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Automatic Rollback & Recovery</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Enable Rollback System</span>
              <Tooltip text="Master switch for all recovery features. When off, nothing will be automatically recovered." />
            </div>
            <Toggle 
              checked={config.enableRollback} 
              onChange={(val) => updateConfig('enableRollback', val)}
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-200">Recover Channels</span>
                <Tooltip text="Automatically recreate deleted channels with their settings and permissions" />
              </div>
              <Toggle 
                checked={config.rollbackChannels} 
                onChange={(val) => updateConfig('rollbackChannels', val)}
                disabled={isFormDisabled || !config.enableRollback}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-200">Recover Roles</span>
                <Tooltip text="Automatically recreate deleted roles with their permissions and colors" />
              </div>
              <Toggle 
                checked={config.rollbackRoles} 
                onChange={(val) => updateConfig('rollbackRoles', val)}
                disabled={isFormDisabled || !config.enableRollback}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-200">Recover Emojis</span>
                <Tooltip text="Automatically restore deleted emojis from backup cache" />
              </div>
              <Toggle 
                checked={config.rollbackEmojis} 
                onChange={(val) => updateConfig('rollbackEmojis', val)}
                disabled={isFormDisabled || !config.enableRollback}
              />
            </div>
          </div>

          {/* Backup Storage Limits */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
              Backup Storage Limits
              <Tooltip text="Maximum items to keep in backup cache. Limits memory usage while keeping most important items backed up." />
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Channels</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={config.maxChannelBackups}
                  onChange={(e) => updateConfig('maxChannelBackups', validateNumberInput(e.target.value, 5, 100))}
                  onBlur={(e) => {
                    const validated = validateNumberInput(e.target.value, 5, 100);
                    if (validated !== config.maxChannelBackups) {
                      updateConfig('maxChannelBackups', validated);
                    }
                  }}
                  disabled={isFormDisabled || !config.enableRollback}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Roles</label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={config.maxRoleBackups}
                  onChange={(e) => updateConfig('maxRoleBackups', validateNumberInput(e.target.value, 10, 200))}
                  onBlur={(e) => {
                    const validated = validateNumberInput(e.target.value, 10, 200);
                    if (validated !== config.maxRoleBackups) {
                      updateConfig('maxRoleBackups', validated);
                    }
                  }}
                  disabled={isFormDisabled || !config.enableRollback}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Emojis</label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={config.maxEmojiBackups}
                  onChange={(e) => updateConfig('maxEmojiBackups', validateNumberInput(e.target.value, 20, 500))}
                  onBlur={(e) => {
                    const validated = validateNumberInput(e.target.value, 20, 500);
                    if (validated !== config.maxEmojiBackups) {
                      updateConfig('maxEmojiBackups', validated);
                    }
                  }}
                  disabled={isFormDisabled || !config.enableRollback}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Stickers</label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={config.maxStickerBackups}
                  onChange={(e) => updateConfig('maxStickerBackups', validateNumberInput(e.target.value, 20, 500))}
                  onBlur={(e) => {
                    const validated = validateNumberInput(e.target.value, 20, 500);
                    if (validated !== config.maxStickerBackups) {
                      updateConfig('maxStickerBackups', validated);
                    }
                  }}
                  disabled={isFormDisabled || !config.enableRollback}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                Backup Age Limit (hours)
                <Tooltip text="How long to keep backups. Older backups are automatically deleted to save memory." />
              </div>
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={config.backupRetentionHours}
              onChange={(e) => updateConfig('backupRetentionHours', validateNumberInput(e.target.value, 1, 168))}
              onBlur={(e) => {
                const validated = validateNumberInput(e.target.value, 1, 168);
                if (validated !== config.backupRetentionHours) {
                  updateConfig('backupRetentionHours', validated);
                }
              }}
              disabled={isFormDisabled || !config.enableRollback}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Min: 1 hour, Max: 1 week (168 hours)</p>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Advanced Features</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Progressive Alerts</span>
              <Tooltip text="Sends a warning to the owner when someone is 1 action away from triggering punishment. Helps catch threats early." />
            </div>
            <Toggle 
              checked={config.progressiveAlerts} 
              onChange={(val) => updateConfig('progressiveAlerts', val)}
              disabled={isFormDisabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Anti-Webhook Spam</span>
              <Tooltip text="Limits webhooks per channel to prevent spam attacks where attackers create hundreds of webhooks." />
            </div>
            <Toggle 
              checked={config.antiWebhookSpam} 
              onChange={(val) => updateConfig('antiWebhookSpam', val)}
              disabled={isFormDisabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Anti-SelfBot Detection</span>
              <Tooltip text="Ignores actions by this bot itself to prevent false positives when the bot is legitimately managing the server." />
            </div>
            <Toggle 
              checked={config.antiSelfBot} 
              onChange={(val) => updateConfig('antiSelfBot', val)}
              disabled={isFormDisabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                Max Webhooks per Channel
                <Tooltip text="Maximum number of webhooks allowed per channel when anti-webhook spam is enabled" />
              </div>
            </label>
            <input
              type="number"
              min="1"
              max="15"
              value={config.maxWebhooksPerChannel}
              onChange={(e) => updateConfig('maxWebhooksPerChannel', validateNumberInput(e.target.value, 1, 15))}
              onBlur={(e) => {
                const validated = validateNumberInput(e.target.value, 1, 15);
                if (validated !== config.maxWebhooksPerChannel) {
                  updateConfig('maxWebhooksPerChannel', validated);
                }
              }}
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Performance Tuning */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Performance Tuning</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                Audit Log Cache Duration (ms)
                <Tooltip text="How long to cache Discord audit logs. Higher = fewer API calls but slightly stale data. 2000ms is optimal." />
              </div>
            </label>
            <input
              type="number"
              min="500"
              max="10000"
              step="500"
              value={config.auditLogCacheDuration}
              onChange={(e) => updateConfig('auditLogCacheDuration', validateNumberInput(e.target.value, 500, 10000))}
              onBlur={(e) => {
                const validated = validateNumberInput(e.target.value, 500, 10000);
                if (validated !== config.auditLogCacheDuration) {
                  updateConfig('auditLogCacheDuration', validated);
                }
              }}
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Min: 500ms, Max: 10000ms</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                Event Batch Window (ms)
                <Tooltip text="Groups events within this window for efficient processing. Lower = more responsive but higher CPU usage." />
              </div>
            </label>
            <input
              type="number"
              min="100"
              max="1000"
              step="50"
              value={config.eventBatchWindow}
              onChange={(e) => updateConfig('eventBatchWindow', validateNumberInput(e.target.value, 100, 1000))}
              onBlur={(e) => {
                const validated = validateNumberInput(e.target.value, 100, 1000);
                if (validated !== config.eventBatchWindow) {
                  updateConfig('eventBatchWindow', validated);
                }
              }}
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Min: 100ms, Max: 1000ms</p>
          </div>
{/* 
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Debug Mode</span>
              <Tooltip text="Enables detailed console logging for troubleshooting. Disable in production as it creates lots of log spam." />
            </div>
            <Toggle 
              checked={config.debug} 
              onChange={(val) => updateConfig('debug', val)}
              disabled={isFormDisabled}
            />
          </div> */}
        </div>
      </div>

      {/* Logging & Notifications */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Logging & Notifications</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Notify Server Owner</span>
              <Tooltip text="Sends detailed DM to server owner when violations occur, including what failed and why." />
            </div>
            <Toggle 
              checked={config.notifyOwner} 
              onChange={(val) => updateConfig('notifyOwner', val)}
              disabled={isFormDisabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Log to Channel</span>
              <Tooltip text="Logs all anti-nuke actions and detections to the configured log channel" />
            </div>
            <Toggle 
              checked={config.logActions} 
              onChange={(val) => updateConfig('logActions', val)}
              disabled={isFormDisabled}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              Log Channel ID (optional)
              <Tooltip text="Specific channel for anti-nuke logs. Leave empty to use system channel. Right-click channel > Copy ID to get this." />
            </div>
          </label>
          <input
            type="text"
            placeholder="e.g. 1234567890123456789"
            value={config.logChannelId || ''}
            onChange={(e) => updateConfig('logChannelId', e.target.value || null)}
            disabled={isFormDisabled}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Trust Settings */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Trust Settings</h3>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-200">Bypass Trusted Users/Roles</span>
            <Tooltip text="Allow trusted users/roles to bypass all anti-nuke protections. Use with extreme caution!" />
          </div>
          <Toggle 
            checked={config.bypassTrusted} 
            onChange={(val) => updateConfig('bypassTrusted', val)}
            disabled={isFormDisabled}
          />
        </div>

        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Warning: Trusted users can bypass ALL protections. Only add administrators you completely trust. Server owners are automatically trusted and cannot be punished.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-200">Trusted Users</h4>
              <button
                onClick={addTrustedUser}
                disabled={isFormDisabled}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Add User
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {config.trustedUsers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No trusted users configured</p>
              ) : (
                config.trustedUsers.map((userId) => (
                  <div key={userId} className="flex items-center justify-between bg-gray-900/70 rounded-lg px-4 py-3 border border-gray-700/50 group hover:border-gray-600 transition-colors">
                    <span className="text-sm font-mono text-gray-300">{userId}</span>
                    <button
                      onClick={() => removeTrustedUser(userId)}
                      disabled={isFormDisabled}
                      className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-200">Trusted Roles</h4>
              <button
                onClick={addTrustedRole}
                disabled={isFormDisabled}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Add Role
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {config.trustedRoles.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No trusted roles configured</p>
              ) : (
                config.trustedRoles.map((roleId) => (
                  <div key={roleId} className="flex items-center justify-between bg-gray-900/70 rounded-lg px-4 py-3 border border-gray-700/50 group hover:border-gray-600 transition-colors">
                    <span className="text-sm font-mono text-gray-300">{roleId}</span>
                    <button
                      onClick={() => removeTrustedRole(roleId)}
                      disabled={isFormDisabled}
                      className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-0 bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl p-6 shadow-2xl">
        <button
          onClick={saveConfig}
          disabled={isFormDisabled || !selectedGuild || saveStatus === 'success'}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${
            saveStatus === 'saving' 
              ? 'bg-red-600 cursor-wait' 
              : saveStatus === 'success'
              ? 'bg-green-600'
              : saveStatus === 'error'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 active:scale-[0.98]'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
        >
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving Configuration...</span>
            </>
          )}
          {saveStatus === 'success' && (
            <>
              <Check className="w-5 h-5" />
              <span>Configuration Saved!</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <X className="w-5 h-5" />
              <span>Failed to Save - Try Again</span>
            </>
          )}
          {saveStatus === 'idle' && (
            <>
              <Save className="w-5 h-5" />
              <span>Save Anti-Nuke Configuration</span>
            </>
          )}
        </button>
        {lastSaveTime > 0 && saveStatus === 'idle' && (
          <p className="text-center text-xs text-gray-500 mt-3">
            Last saved: {new Date(lastSaveTime).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Configuration Summary */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Configuration Summary</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">System Status</div>
            <div className={`font-semibold ${config.enabled ? 'text-green-400' : 'text-red-400'}`}>
              {config.enabled ? '🛡️ Protected' : '⚠️ Disabled'}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Channel Safety</div>
            <div className="font-semibold text-yellow-400">
              {config.channelDeleteThreshold} max
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Role Safety</div>
            <div className="font-semibold text-yellow-400">
              {config.roleDeleteThreshold} max
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Ban Protection</div>
            <div className="font-semibold text-yellow-400">
              {config.banThreshold} max
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Auto-Recovery</div>
            <div className={`font-semibold ${config.enableRollback ? 'text-green-400' : 'text-gray-500'}`}>
              {config.enableRollback ? 'Active' : 'Disabled'}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Bot Monitoring</div>
            <div className={`font-semibold ${config.monitorBots ? 'text-cyan-400' : 'text-gray-500'}`}>
              {config.monitorBots ? `${Math.floor(config.botThresholdMultiplier * 100)}% strict` : 'Off'}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Circuit Breaker</div>
            <div className="font-semibold text-red-400">
              {config.circuitBreakerThreshold} in 1s
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Punishments</div>
            <div className="font-semibold text-purple-400">
              {config.punishmentActions.length} active
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(31, 41, 55);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(75, 85, 99);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(107, 114, 128);
        }
      `}</style>
    </div>
  );
}