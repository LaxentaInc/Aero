'use client';

import { useState, useEffect } from 'react';
import { Info, Save, Check, X, Loader2, Shield, Users, Settings, Bell, FileText, AlertTriangle, Zap, RotateCcw, Cpu } from 'lucide-react';

// MATCHES API EXACTLY
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
  trustedUsers: string[];
  trustedRoles: string[];
  bypassTrusted: boolean;
  botAutoban: boolean;
  userPunishmentActions: string[];
  timeoutDuration: number;
  rapidFireEnabled: boolean;
  rapidFireThreshold: number;
  rapidFireWindow: number;
  rapidFireAction: string;
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
  logChannelId: string | null;
  logActions: boolean;
  auditLogCacheDuration: number;
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

// Matches API getDefaultConfig() exactly
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
  trustedUsers: [],
  trustedRoles: [],
  bypassTrusted: true,
  botAutoban: true,
  userPunishmentActions: ['remove_roles', 'timeout'],
  timeoutDuration: 1800,
  rapidFireEnabled: true,
  rapidFireThreshold: 2,
  rapidFireWindow: 1000,
  rapidFireAction: 'ban',
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
  logChannelId: null,
  logActions: true,
  auditLogCacheDuration: 2000,
  debug: false
};

const punishmentOptions = [
  { value: 'remove_roles', label: 'Remove Dangerous Roles', description: 'Strips all roles with admin/destructive permissions' },
  { value: 'timeout', label: 'Timeout', description: 'Temporarily mute the violator' },
  { value: 'kick', label: 'Kick from Server', description: 'Immediately remove from server (can rejoin)' },
  { value: 'ban', label: 'Ban from Server', description: 'Permanent removal (cannot rejoin)' }
];

const rapidFireActionOptions = [
  { value: 'ban', label: 'Ban', description: 'Instantly ban on rapid-fire detection' },
  { value: 'kick', label: 'Kick', description: 'Instantly kick on rapid-fire detection' },
  { value: 'timeout', label: 'Timeout', description: 'Instantly timeout on rapid-fire detection' }
];

const validateNumberInput = (value: string, min: number, max?: number): number => {
  const numValue = parseInt(value);
  if (isNaN(numValue)) return min;
  if (numValue < min) return min;
  if (max !== undefined && numValue > max) return max;
  return numValue;
};

const Tooltip = ({ text, children }: { text: string; children?: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="cursor-help">
        {children || <Info className="w-4 h-4 text-gray-500" />}
      </div>
      {show && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-700 whitespace-nowrap">
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
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
};

const Checkbox = ({ checked, onChange, disabled, label }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; label?: string }) => {
  return (
    <label className="flex items-center cursor-pointer group">
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="sr-only" />
        <div className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
          checked ? 'bg-blue-600 border-blue-600' : 'bg-gray-700 border-gray-600 group-hover:border-gray-500'
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
        const data = await response.json();
        setConfig(data.config);
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
        setSaveStatus('success');
        setLastSaveTime(now);
        onSave?.(true, 'Anti-Nuke configuration saved successfully!');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
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
    const current = config.userPunishmentActions;
    if (current.includes(action)) {
      updateConfig('userPunishmentActions', current.filter(a => a !== action));
    } else {
      updateConfig('userPunishmentActions', [...current, action]);
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
            <p className="text-gray-400 text-sm">Advanced protection against mass destructive actions and server raids</p>
          </div>
        </div>
      </div>

      {/* Module Status */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${config.enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
            <span className="font-medium text-white">Module Status</span>
            <Tooltip text="Enable or disable the entire anti-nuke protection system" />
          </div>
          <Toggle checked={config.enabled} onChange={(val) => updateConfig('enabled', val)} disabled={isFormDisabled} />
        </div>
      </div>

      {/* Core Settings */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Core Protection Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                Detection Time Window (seconds)
                <Tooltip text="Actions within this time period are counted together" />
              </div>
            </label>
            <input
              type="number"
              min="10"
              max="300"
              value={config.timeWindow}
              onChange={(e) => updateConfig('timeWindow', validateNumberInput(e.target.value, 10, 300))}
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">Min: 10s, Max: 300s</p>
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
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">Current: {Math.floor(config.timeoutDuration / 60)} minutes</p>
          </div>
        </div>
      </div>

      {/* Destruction Thresholds */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Destruction Thresholds</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">Maximum actions allowed within the time window</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Channels Deleted</label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.channelDeleteThreshold}
              onChange={(e) => updateConfig('channelDeleteThreshold', validateNumberInput(e.target.value, 1, 20))}
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
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
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Members Banned</label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.banThreshold}
              onChange={(e) => updateConfig('banThreshold', validateNumberInput(e.target.value, 1, 20))}
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
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
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
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
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
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
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
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
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Bot Handling */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Bot Account Handling</h3>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-200">Auto-ban Malicious Bots</span>
            <Tooltip text="Automatically ban bot accounts that trigger anti-nuke protection. Recommended: ON" />
          </div>
          <Toggle checked={config.botAutoban} onChange={(val) => updateConfig('botAutoban', val)} disabled={isFormDisabled} />
        </div>
      </div>

      {/* Rapid Fire Detection */}
      <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Rapid-Fire Detection (Instant Response)</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">Emergency system that triggers immediately on extremely fast attacks</p>
        
        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-200">Enable Rapid-Fire Detection</span>
            <Tooltip text="When enabled, triggers instant punishment if threshold is exceeded within the rapid-fire window" />
          </div>
          <Toggle checked={config.rapidFireEnabled} onChange={(val) => updateConfig('rapidFireEnabled', val)} disabled={isFormDisabled} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                Rapid-Fire Threshold
                <Tooltip text="Number of actions that trigger instant punishment within the rapid-fire window" />
              </div>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={config.rapidFireThreshold}
              onChange={(e) => updateConfig('rapidFireThreshold', validateNumberInput(e.target.value, 1, 10))}
              disabled={isFormDisabled || !config.rapidFireEnabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                Rapid-Fire Window (ms)
                <Tooltip text="Time window for detecting rapid-fire attacks (milliseconds)" />
              </div>
            </label>
            <input
              type="number"
              min="100"
              max="5000"
              step="100"
              value={config.rapidFireWindow}
              onChange={(e) => updateConfig('rapidFireWindow', validateNumberInput(e.target.value, 100, 5000))}
              disabled={isFormDisabled || !config.rapidFireEnabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">{config.rapidFireWindow / 1000} seconds</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                Rapid-Fire Action
                <Tooltip text="Instant punishment when rapid-fire is detected" />
              </div>
            </label>
            <select
              value={config.rapidFireAction}
              onChange={(e) => updateConfig('rapidFireAction', e.target.value)}
              disabled={isFormDisabled || !config.rapidFireEnabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all disabled:opacity-50"
            >
              {rapidFireActionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* User Punishment Actions */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">User Punishments</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">Actions taken automatically when thresholds are exceeded</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {punishmentOptions.map((option) => (
            <div key={option.value} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={config.userPunishmentActions.includes(option.value)}
                  onChange={() => togglePunishmentAction(option.value)}
                  disabled={isFormDisabled}
                />
                <div>
                  <span className="text-sm font-medium text-gray-200">{option.label}</span>
                  <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                </div>
              </div>
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
              <Tooltip text="Master switch for all recovery features" />
            </div>
            <Toggle checked={config.enableRollback} onChange={(val) => updateConfig('enableRollback', val)} disabled={isFormDisabled} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <span className="text-sm font-medium text-gray-200">Recover Channels</span>
              <Toggle checked={config.rollbackChannels} onChange={(val) => updateConfig('rollbackChannels', val)} disabled={isFormDisabled || !config.enableRollback} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <span className="text-sm font-medium text-gray-200">Recover Roles</span>
              <Toggle checked={config.rollbackRoles} onChange={(val) => updateConfig('rollbackRoles', val)} disabled={isFormDisabled || !config.enableRollback} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <span className="text-sm font-medium text-gray-200">Recover Emojis</span>
              <Toggle checked={config.rollbackEmojis} onChange={(val) => updateConfig('rollbackEmojis', val)} disabled={isFormDisabled || !config.enableRollback} />
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Backup Storage Limits</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Channels</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={config.maxChannelBackups}
                  onChange={(e) => updateConfig('maxChannelBackups', validateNumberInput(e.target.value, 5, 100))}
                  disabled={isFormDisabled || !config.enableRollback}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                  disabled={isFormDisabled || !config.enableRollback}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                  disabled={isFormDisabled || !config.enableRollback}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                  disabled={isFormDisabled || !config.enableRollback}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                Backup Retention (hours)
                <Tooltip text="How long to keep backups before auto-deletion" />
              </div>
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={config.backupRetentionHours}
              onChange={(e) => updateConfig('backupRetentionHours', validateNumberInput(e.target.value, 1, 168))}
              disabled={isFormDisabled || !config.enableRollback}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">Max: 1 week (168 hours)</p>
          </div>
        </div>
      </div>

      {/* Logging & Notifications */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Logging & Notifications</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <span className="text-sm font-medium text-gray-200">Notify Server Owner</span>
            <Toggle checked={config.notifyOwner} onChange={(val) => updateConfig('notifyOwner', val)} disabled={isFormDisabled} />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <span className="text-sm font-medium text-gray-200">Log to Channel</span>
            <Toggle checked={config.logActions} onChange={(val) => updateConfig('logActions', val)} disabled={isFormDisabled} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              Log Channel ID (optional)
              <Tooltip text="Specific channel for anti-nuke logs" />
            </div>
          </label>
          <input
            type="text"
            placeholder="e.g. 1234567890123456789"
            value={config.logChannelId || ''}
            onChange={(e) => updateConfig('logChannelId', e.target.value || null)}
            disabled={isFormDisabled}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Performance */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Performance Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                Audit Log Cache Duration (ms)
                <Tooltip text="How long to cache Discord audit logs" />
              </div>
            </label>
            <input
              type="number"
              min="500"
              max="10000"
              step="500"
              value={config.auditLogCacheDuration}
              onChange={(e) => updateConfig('auditLogCacheDuration', validateNumberInput(e.target.value, 500, 10000))}
              disabled={isFormDisabled}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Debug Mode</span>
              <Tooltip text="Enable detailed console logging" />
            </div>
            <Toggle checked={config.debug} onChange={(val) => updateConfig('debug', val)} disabled={isFormDisabled} />
          </div>
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
            <Tooltip text="Allow trusted users/roles to bypass all protections" />
          </div>
          <Toggle checked={config.bypassTrusted} onChange={(val) => updateConfig('bypassTrusted', val)} disabled={isFormDisabled} />
        </div>

        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Warning: Trusted users can bypass ALL protections. Only add administrators you completely trust.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-200">Trusted Users</h4>
              <button
                onClick={addTrustedUser}
                disabled={isFormDisabled}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
              >
                Add User
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {config.trustedUsers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No trusted users</p>
              ) : (
                config.trustedUsers.map((userId) => (
                  <div key={userId} className="flex items-center justify-between bg-gray-900/70 rounded-lg px-4 py-3 border border-gray-700/50 group">
                    <span className="text-sm font-mono text-gray-300">{userId}</span>
                    <button
                      onClick={() => removeTrustedUser(userId)}
                      disabled={isFormDisabled}
                      className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
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
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
              >
                Add Role
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {config.trustedRoles.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No trusted roles</p>
              ) : (
                config.trustedRoles.map((roleId) => (
                  <div key={roleId} className="flex items-center justify-between bg-gray-900/70 rounded-lg px-4 py-3 border border-gray-700/50 group">
                    <span className="text-sm font-mono text-gray-300">{roleId}</span>
                    <button
                      onClick={() => removeTrustedRole(roleId)}
                      disabled={isFormDisabled}
                      className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
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
          } disabled:opacity-50 disabled:cursor-not-allowed`}
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
