'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';
import { Info, Save, Check, X, Loader2, Shield, Users, Settings, Bell, FileText } from 'lucide-react';

// Types
interface AntiPermissionAbuseConfig {
  enabled: boolean;
  trustedUsers: string[];
  trustedRoles: string[];
  bypassTrusted: boolean;
  dangerousPermissions: string[];
  monitorRoleCreation: boolean;
  monitorRoleUpdates: boolean;
  monitorRoleAssignments: boolean;
  punishmentActions: string[];
  stripExecutorRoles: boolean;
  timeoutDuration: number;
  monitorBots: boolean;
  notifyOwner: boolean;
  notifyOnPermissionFailure: boolean;
  notifyOnDuplicates: boolean;
  logChannelId: string | null;
  logActions: boolean;
  punishmentCooldown: number;
  auditLogCacheDuration: number;
  auditLogTimeout: number;
  debug: boolean;
}

interface ModuleConfigProps {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}

export const moduleInfo = {
  id: 'anti-permission-abuse',
  name: 'Anti Permission Abuse',
  description: 'Protect against dangerous permission changes and role abuse',
  category: 'moderation',
};

const defaultConfig: AntiPermissionAbuseConfig = {
  enabled: true,
  trustedUsers: [],
  trustedRoles: [],
  bypassTrusted: true,
  dangerousPermissions: ['Administrator', 'ManageGuild', 'ManageRoles'],
  monitorRoleCreation: true,
  monitorRoleUpdates: true,
  monitorRoleAssignments: true,
  punishmentActions: ['remove_roles', 'timeout'],
  stripExecutorRoles: true,
  timeoutDuration: 600,
  monitorBots: false,
  notifyOwner: true,
  notifyOnPermissionFailure: true,
  notifyOnDuplicates: false,
  logChannelId: null,
  logActions: true,
  punishmentCooldown: 300,
  auditLogCacheDuration: 60,
  auditLogTimeout: 5000,
  debug: false
};

const punishmentOptions = [
  { value: 'remove_roles', label: 'Remove Roles', tooltip: 'Strip all roles from the abuser' },
  { value: 'timeout', label: 'Timeout', tooltip: 'Timeout the member for configured duration' }
];

const permissionOptions = [
  { value: 'Administrator', label: 'Administrator', tooltip: 'Full server control' },
  { value: 'ManageGuild', label: 'Manage Server', tooltip: 'Server settings and integrations' },
  { value: 'ManageRoles', label: 'Manage Roles', tooltip: 'Create and edit roles' },
  { value: 'ManageChannels', label: 'Manage Channels', tooltip: 'Create and edit channels' },
  { value: 'BanMembers', label: 'Ban Members', tooltip: 'Ban members from server' },
  { value: 'KickMembers', label: 'Kick Members', tooltip: 'Kick members from server' },
  { value: 'ManageWebhooks', label: 'Manage Webhooks', tooltip: 'Create and manage webhooks' },
  { value: 'ManageGuildExpressions', label: 'Manage Emojis & Stickers', tooltip: 'Manage server emojis and stickers' }
];

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
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

export default function AntiPermissionAbuseConfig({ selectedGuild, onSave }: ModuleConfigProps) {
  const [config, setConfig] = useState<AntiPermissionAbuseConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);
  const { getCached, setCached } = useConfigCache();

  useEffect(() => {
    if (selectedGuild) {
      loadConfig();
    }
  }, [selectedGuild]);

  const loadConfig = async () => {
    const cacheKey = `anti-permission-abuse-${selectedGuild}`;
    const cached = getCached(cacheKey);
    if (cached) {
      setConfig(cached);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/APA?guildId=${selectedGuild}`);
      
      if (response.ok) {
        const data = await response.json();
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
    const cooldown = 15000; // 5 seconds cooldown
    
    if (timeSinceLastSave < cooldown) {
      onSave?.(false, `Please wait ${Math.ceil((cooldown - timeSinceLastSave) / 1000)} seconds before saving again`);
      return;
    }
    
    setSaving(true);
    setSaveStatus('saving');
    
    try {
      const response = await fetch('/api/APA', {
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
        const cacheKey = `anti-permission-abuse-${selectedGuild}`;
        setCached(cacheKey, config);
        setSaveStatus('success');
        setLastSaveTime(now);
        onSave?.(true, 'Configuration saved successfully!');
        
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

  const updateConfig = (key: keyof AntiPermissionAbuseConfig, value: any) => {
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

  const togglePermission = (permission: string) => {
    const current = config.dangerousPermissions;
    if (current.includes(permission)) {
      updateConfig('dangerousPermissions', current.filter(p => p !== permission));
    } else {
      updateConfig('dangerousPermissions', [...current, permission]);
    }
  };

  const isFormDisabled = loading || saving;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <div className="text-gray-400">Loading configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600/20 rounded-lg">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Anti Permission Abuse</h2>
            <p className="text-gray-400 text-sm">Monitor and prevent dangerous permission changes and role abuse in your server</p>
          </div>
        </div>
      </div>

      {/* Module Status */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${config.enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
            <span className="font-medium text-white">Module Status</span>
            <Tooltip text="Enable or disable the entire module">
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

      {/* Monitoring Settings */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Monitoring Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Monitor Role Creation</span>
              <Tooltip text="Track when new roles are created">
                <Info className="w-4 h-4 text-gray-500" />
              </Tooltip>
            </div>
            <Toggle 
              checked={config.monitorRoleCreation} 
              onChange={(val) => updateConfig('monitorRoleCreation', val)}
              disabled={isFormDisabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Monitor Role Updates</span>
              <Tooltip text="Track when roles are modified">
                <Info className="w-4 h-4 text-gray-500" />
              </Tooltip>
            </div>
            <Toggle 
              checked={config.monitorRoleUpdates} 
              onChange={(val) => updateConfig('monitorRoleUpdates', val)}
              disabled={isFormDisabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Monitor Role Assignments</span>
              <Tooltip text="Track when roles are given to members">
                <Info className="w-4 h-4 text-gray-500" />
              </Tooltip>
            </div>
            <Toggle 
              checked={config.monitorRoleAssignments} 
              onChange={(val) => updateConfig('monitorRoleAssignments', val)}
              disabled={isFormDisabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Monitor Bots</span>
              <Tooltip text="Also monitor actions performed by bots">
                <Info className="w-4 h-4 text-gray-500" />
              </Tooltip>
            </div>
            <Toggle 
              checked={config.monitorBots} 
              onChange={(val) => updateConfig('monitorBots', val)}
              disabled={isFormDisabled}
            />
          </div>
        </div>
      </div>

      {/* Dangerous Permissions */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Dangerous Permissions to Monitor</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {permissionOptions.map((option) => (
            <div key={option.value} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={config.dangerousPermissions.includes(option.value)}
                    onChange={() => togglePermission(option.value)}
                    disabled={isFormDisabled}
                  />
                  <span className="text-sm font-medium text-gray-200">{option.label}</span>
                </div>
                <Tooltip text={option.tooltip}>
                  <Info className="w-4 h-4 text-gray-500" />
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Punishment Actions */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Punishment Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Punishment Actions</label>
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
              </div>
            ))}
            
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-200">Strip Executor Roles</span>
                <Tooltip text="Remove all roles from the abuser">
                  <Info className="w-4 h-4 text-gray-500" />
                </Tooltip>
              </div>
              <Toggle 
                checked={config.stripExecutorRoles} 
                onChange={(val) => updateConfig('stripExecutorRoles', val)}
                disabled={isFormDisabled}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  Timeout Duration (seconds)
                  <Tooltip text="How long to timeout abusers (60-2419200)">
                    <Info className="w-4 h-4 text-gray-500" />
                  </Tooltip>
                </div>
              </label>
              <input
                type="number"
                min="60"
                max="2419200"
                value={config.timeoutDuration}
                onChange={(e) => updateConfig('timeoutDuration', parseInt(e.target.value) || 60)}
                disabled={isFormDisabled}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  Punishment Cooldown (seconds)
                  <Tooltip text="Minimum time between punishments">
                    <Info className="w-4 h-4 text-gray-500" />
                  </Tooltip>
                </div>
              </label>
              <input
                type="number"
                min="1"
                value={config.punishmentCooldown}
                onChange={(e) => updateConfig('punishmentCooldown', parseInt(e.target.value) || 1)}
                disabled={isFormDisabled}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  Audit Log Cache Duration (seconds)
                  <Tooltip text="How long to cache audit log entries">
                    <Info className="w-4 h-4 text-gray-500" />
                  </Tooltip>
                </div>
              </label>
              <input
                type="number"
                min="1"
                value={config.auditLogCacheDuration}
                onChange={(e) => updateConfig('auditLogCacheDuration', parseInt(e.target.value) || 1)}
                disabled={isFormDisabled}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  Audit Log Timeout (ms)
                  <Tooltip text="Maximum time to wait for audit log">
                    <Info className="w-4 h-4 text-gray-500" />
                  </Tooltip>
                </div>
              </label>
              <input
                type="number"
                min="1000"
                max="30000"
                value={config.auditLogTimeout}
                onChange={(e) => updateConfig('auditLogTimeout', parseInt(e.target.value) || 1000)}
                disabled={isFormDisabled}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trust Settings */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Trust Settings</h3>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-200">Bypass Trusted Users/Roles</span>
            <Tooltip text="Allow trusted users/roles to bypass all checks">
              <Info className="w-4 h-4 text-gray-500" />
            </Tooltip>
          </div>
          <Toggle 
            checked={config.bypassTrusted} 
            onChange={(val) => updateConfig('bypassTrusted', val)}
            disabled={isFormDisabled}
          />
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

      {/* Notifications & Logging */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Notifications & Logging</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Notify Owner</span>
              <Tooltip text="Send DM to server owner on detection">
                <Info className="w-4 h-4 text-gray-500" />
              </Tooltip>
            </div>
            <Toggle 
              checked={config.notifyOwner} 
              onChange={(val) => updateConfig('notifyOwner', val)}
              disabled={isFormDisabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Log Actions</span>
              <Tooltip text="Log all detections and actions">
                <Info className="w-4 h-4 text-gray-500" />
              </Tooltip>
            </div>
            <Toggle 
              checked={config.logActions} 
              onChange={(val) => updateConfig('logActions', val)}
              disabled={isFormDisabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Notify on Permission Failure</span>
              <Tooltip text="Alert when bot lacks permissions to punish">
                <Info className="w-4 h-4 text-gray-500" />
              </Tooltip>
            </div>
            <Toggle 
              checked={config.notifyOnPermissionFailure} 
              onChange={(val) => updateConfig('notifyOnPermissionFailure', val)}
              disabled={isFormDisabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Notify on Duplicates</span>
              <Tooltip text="Alert on duplicate detection attempts">
                <Info className="w-4 h-4 text-gray-500" />
              </Tooltip>
            </div>
            <Toggle 
              checked={config.notifyOnDuplicates} 
              onChange={(val) => updateConfig('notifyOnDuplicates', val)}
              disabled={isFormDisabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200">Debug Mode</span>
              <Tooltip text="Enable detailed debug logging">
                <Info className="w-4 h-4 text-gray-500" />
              </Tooltip>
            </div>
            <Toggle 
              checked={config.debug} 
              onChange={(val) => updateConfig('debug', val)}
              disabled={isFormDisabled}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              Log Channel ID (optional)
              <Tooltip text="Channel to send detailed logs to">
                <Info className="w-4 h-4 text-gray-500" />
              </Tooltip>
            </div>
          </label>
          <input
            type="text"
            placeholder="Enter Discord Channel ID"
            value={config.logChannelId || ''}
            onChange={(e) => updateConfig('logChannelId', e.target.value || null)}
            disabled={isFormDisabled}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-0 bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl p-6 shadow-2xl">
        <button
          onClick={saveConfig}
          disabled={isFormDisabled || !selectedGuild || saveStatus === 'success'}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${
            saveStatus === 'saving' 
              ? 'bg-blue-600 cursor-wait' 
              : saveStatus === 'success'
              ? 'bg-green-600'
              : saveStatus === 'error'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-[0.98]'
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
              <span>Save Configuration</span>
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
            <div className="text-xs text-gray-400 mb-1">Status</div>
            <div className={`font-semibold ${config.enabled ? 'text-green-400' : 'text-red-400'}`}>
              {config.enabled ? 'Active' : 'Disabled'}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Monitoring</div>
            <div className="font-semibold text-purple-400">
              {[config.monitorRoleCreation, config.monitorRoleUpdates, config.monitorRoleAssignments].filter(Boolean).length} / 3
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Permissions Tracked</div>
            <div className="font-semibold text-yellow-400">
              {config.dangerousPermissions.length}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Punishment Actions</div>
            <div className="font-semibold text-orange-400">
              {config.punishmentActions.length}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Timeout Duration</div>
            <div className="font-semibold text-blue-400">
              {config.timeoutDuration}s
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Trusted Users</div>
            <div className="font-semibold text-green-400">
              {config.trustedUsers.length}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Trusted Roles</div>
            <div className="font-semibold text-green-400">
              {config.trustedRoles.length}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Notifications</div>
            <div className="font-semibold text-yellow-400">
              {[config.notifyOwner, config.logActions].filter(Boolean).length} / 2
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