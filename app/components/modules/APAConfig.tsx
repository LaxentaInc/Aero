'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';
import { Shield, Key, AlertTriangle } from 'lucide-react';
import {
  Toggle, Card, Row, SectionHeader, Select, NumberInput,
  IdList, CheckboxGroup, SaveBar, ConfigLoading, AdvancedToggle, promptId, MasterToggle
} from './ui';

// --- types (matches api exactly) ---
interface APAConfig {
  enabled: boolean;
  trustedUsers: string[];
  trustedRoles: string[];
  whitelistedUsers: string[];
  bypassTrusted: boolean;
  dangerousPermissions: string[];
  monitorRoleCreation: boolean;
  monitorRoleUpdates: boolean;
  monitorRoleAssignments: boolean;
  punishmentActions: string[];
  stripExecutorRoles: boolean;
  timeoutMinutes: number;
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

const defaultConfig: APAConfig = {
  enabled: true,
  trustedUsers: [],
  trustedRoles: [],
  whitelistedUsers: [],
  bypassTrusted: true,
  dangerousPermissions: ['Administrator', 'ManageGuild', 'ManageRoles'],
  monitorRoleCreation: true,
  monitorRoleUpdates: true,
  monitorRoleAssignments: true,
  punishmentActions: ['remove_roles', 'timeout'],
  stripExecutorRoles: true,
  timeoutMinutes: 30, // MATCHES BACKEND: timeoutMinutes
  monitorBots: false,
  notifyOwner: true,
  notifyOnPermissionFailure: true,
  notifyOnDuplicates: false,
  logChannelId: null,
  logActions: true,
  punishmentCooldown: 300,
  auditLogCacheDuration: 2000,
  auditLogTimeout: 5000,
  debug: false
};

const punishmentOpts = [
  { value: 'remove_roles', label: 'STRIP ROLES' },
  { value: 'timeout', label: 'TIMEOUT' },
];

const permissionOpts = [
  { value: 'Administrator', label: 'Administrator' },
  { value: 'ManageGuild', label: 'Manage Server' },
  { value: 'ManageRoles', label: 'Manage Roles' },
  { value: 'ManageChannels', label: 'Manage Channels' },
  { value: 'BanMembers', label: 'Ban Members' },
  { value: 'KickMembers', label: 'Kick Members' },
  { value: 'ManageWebhooks', label: 'Manage Webhooks' },
  { value: 'ManageGuildExpressions', label: 'Manage Emojis' },
];

export const moduleInfo = {
  id: 'anti-permission-abuse',
  name: 'Anti Permission Abuse',
  description: 'Protect against dangerous permission changes and role abuse',
  category: 'moderation',
};

export default function APAConfig({ selectedGuild, onSave }: {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}) {
  const [config, setConfig] = useState<APAConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [lastSave, setLastSave] = useState(0);
  const { getCached, setCached } = useConfigCache();

  useEffect(() => { if (selectedGuild) loadConfig(); }, [selectedGuild]);

  const loadConfig = async () => {
    const key = `apa-${selectedGuild}`;
    const cached = getCached(key);
    if (cached) { setConfig(cached); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/apa?guildId=${selectedGuild}`);
      if (res.ok) {
        const data = await res.json();

        // Polyfill missing keys from backend payload to match strict types
        const loadedConfig = { ...defaultConfig, ...data.config };
        if (data.config.timeoutDuration !== undefined && data.config.timeoutMinutes === undefined) {
          loadedConfig.timeoutMinutes = Math.floor(data.config.timeoutDuration / 60);
        }

        setConfig(loadedConfig);
        setCached(key, loadedConfig);
      } else {
        setConfig(defaultConfig);
        setCached(key, defaultConfig);
      }
    } catch { setConfig(defaultConfig); }
    finally { setLoading(false); }
  };

  const saveConfig = async () => {
    if (!selectedGuild) return;
    const now = Date.now();
    if (now - lastSave < 15000) {
      onSave?.(false, `Please wait ${Math.ceil((15000 - (now - lastSave)) / 1000)}s before saving.`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/apa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: selectedGuild, config }),
      });
      if (res.ok) {
        setCached(`apa-${selectedGuild}`, config);
        setLastSave(now);
        onSave?.(true, 'Permission abuse config saved.');
      } else throw new Error();
    } catch { onSave?.(false, 'Failed to save configuration.'); }
    finally { setSaving(false); }
  };

  const u = <K extends keyof APAConfig>(k: K, v: APAConfig[K]) =>
    setConfig(p => ({ ...p, [k]: v }));

  // combined "monitor all" toggle
  const allMonitoring = config.monitorRoleCreation && config.monitorRoleUpdates && config.monitorRoleAssignments;
  const toggleAllMonitoring = (on: boolean) => {
    setConfig(p => ({ ...p, monitorRoleCreation: on, monitorRoleUpdates: on, monitorRoleAssignments: on }));
  };

  if (loading) return <ConfigLoading />;
  const dis = saving;

  return (
    <div className="space-y-6 pb-24">
      <MasterToggle
        label="Enable Anti Permission Abuse"
        checked={config.enabled}
        onChange={v => u('enabled', v)}
        disabled={dis}
      />

      <div className={`space-y-6 transition-all duration-500 ${!config.enabled ? 'opacity-50 pointer-events-none grayscale-[0.2]' : ''}`}>
        <Card>
          <SectionHeader icon={<Shield size={20} />} title="Monitoring Scope" />
          <Row label="Monitor All Role Changes" hint="Track the creation, updates, and assignments of all roles.">
            <Toggle checked={allMonitoring} onChange={toggleAllMonitoring} disabled={dis} />
          </Row>
          <Row label="Monitor Bots & Integrations" hint="Also scrutinize permission actions performed by other bots.">
            <Toggle checked={config.monitorBots} onChange={v => u('monitorBots', v)} disabled={dis} />
          </Row>
        </Card>

        {/* punishment */}
        <Card>
          <SectionHeader icon={<AlertTriangle size={20} />} title="Abuse Action & Punishment" />
          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold text-white/50 mb-3 uppercase tracking-widest">Punishment for Abusers</p>
              <CheckboxGroup
                options={punishmentOpts}
                selected={config.punishmentActions}
                onChange={v => u('punishmentActions', v)}
                disabled={dis}
              />
            </div>

            <Row label="Strip Executor Roles" hint="Instantly remove all roles from the user attempting permission abuse.">
              <Toggle checked={config.stripExecutorRoles} onChange={v => u('stripExecutorRoles', v)} disabled={dis} />
            </Row>
          </div>
        </Card>

        {/* notifications */}
        <Card>
          <Row label="DM Server Owner">
            <Toggle checked={config.notifyOwner} onChange={v => u('notifyOwner', v)} disabled={dis} />
          </Row>
          <Row label="Alert Channel ID">
            <input
              type="text"
              placeholder="e.g. 1107155830274523136"
              value={config.logChannelId || ''}
              onChange={e => u('logChannelId', e.target.value || null)}
              disabled={dis}
              className="w-full sm:w-64 bg-[#0f1419] border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] transition-colors disabled:opacity-50"
            />
          </Row>
        </Card>
      </div>

      {/* advanced */}
      <div className="flex justify-center mt-12">
        <AdvancedToggle open={advanced} onToggle={() => setAdvanced(!advanced)} />
      </div>

      {advanced && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <Card>
            <SectionHeader title="Individual Monitors" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <Row label="Role Creation"><Toggle checked={config.monitorRoleCreation} onChange={v => u('monitorRoleCreation', v)} disabled={dis} /></Row>
              <Row label="Role Updates"><Toggle checked={config.monitorRoleUpdates} onChange={v => u('monitorRoleUpdates', v)} disabled={dis} /></Row>
              <Row label="Role Assignments"><Toggle checked={config.monitorRoleAssignments} onChange={v => u('monitorRoleAssignments', v)} disabled={dis} /></Row>
            </div>
          </Card>

          <Card>
            <SectionHeader icon={<Key size={20} />} title="Dangerous Permissions" />
            <p className="text-sm text-white/50 mb-4 font-medium">Select which Discord permissions classify a role update as a potential raid or abuse attempt.</p>
            <CheckboxGroup
              options={permissionOpts}
              selected={config.dangerousPermissions}
              onChange={v => u('dangerousPermissions', v)}
              disabled={dis}
            />
          </Card>

          <Card>
            <SectionHeader title="Core Timing Configurations" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <Row label="Timeout Duration"><NumberInput value={config.timeoutMinutes} onChange={v => u('timeoutMinutes', v)} min={1} max={40320} suffix="min" disabled={dis} /></Row>
              <Row label="Punishment Cooldown"><NumberInput value={config.punishmentCooldown} onChange={v => u('punishmentCooldown', v)} min={1} max={3600} suffix="sec" disabled={dis} /></Row>
              <Row label="Audit Log Cache Duration"><NumberInput value={config.auditLogCacheDuration} onChange={v => u('auditLogCacheDuration', v)} min={100} max={10000} suffix="ms" disabled={dis} /></Row>
              <Row label="Audit Log Fetch Timeout"><NumberInput value={config.auditLogTimeout} onChange={v => u('auditLogTimeout', v)} min={1000} max={30000} suffix="ms" disabled={dis} /></Row>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Notification & Logging Overrides" />
            <Row label="Log All Actions"><Toggle checked={config.logActions} onChange={v => u('logActions', v)} disabled={dis} /></Row>
            <Row label="Notify on System Permission Fetch Failure"><Toggle checked={config.notifyOnPermissionFailure} onChange={v => u('notifyOnPermissionFailure', v)} disabled={dis} /></Row>
            <Row label="Notify on Duplicate Events"><Toggle checked={config.notifyOnDuplicates} onChange={v => u('notifyOnDuplicates', v)} disabled={dis} /></Row>
          </Card>

          <Card>
            <SectionHeader title="Trust Settings" />
            <Row label="Bypass Trusted Users/Roles" hint="Allow trusted entities to bypass APA rules entirely.">
              <Toggle checked={config.bypassTrusted} onChange={v => u('bypassTrusted', v)} disabled={dis} />
            </Row>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 mt-4 border-t border-white/[0.03]">
              <IdList ids={config.trustedUsers} onAdd={() => { const id = promptId('User'); if (id) u('trustedUsers', [...config.trustedUsers, id]); }} onRemove={id => u('trustedUsers', config.trustedUsers.filter(i => i !== id))} label="Trusted Users" disabled={dis} />
              <IdList ids={config.trustedRoles} onAdd={() => { const id = promptId('Role'); if (id) u('trustedRoles', [...config.trustedRoles, id]); }} onRemove={id => u('trustedRoles', config.trustedRoles.filter(i => i !== id))} label="Trusted Roles" disabled={dis} />
            </div>
          </Card>
        </div>
      )}

      <SaveBar onSave={saveConfig} saving={saving} disabled={!selectedGuild} />
    </div>
  );
}