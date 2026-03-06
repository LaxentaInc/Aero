'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';
import { Shield } from 'lucide-react';
import {
  Toggle, Card, Row, SectionHeader, Select, NumberInput,
  IdList, CheckboxGroup, SaveBar, ConfigLoading, AdvancedToggle, promptId
} from './ui';

// --- types (matches api exactly) ---
interface APAConfig {
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

const defaultConfig: APAConfig = {
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

const punishmentOpts = [
  { value: 'remove_roles', label: 'Strip Roles' },
  { value: 'timeout', label: 'Timeout' },
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
      const res = await fetch(`/api/APA?guildId=${selectedGuild}`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setCached(key, data.config);
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
      onSave?.(false, `wait ${Math.ceil((15000 - (now - lastSave)) / 1000)}s`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/APA', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: selectedGuild, config }),
      });
      if (res.ok) {
        setCached(`apa-${selectedGuild}`, config);
        setLastSave(now);
        onSave?.(true, 'permission abuse config saved');
      } else throw new Error();
    } catch { onSave?.(false, 'failed to save'); }
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
    <div className="space-y-4">
      {/* on/off */}
      <Card>
        <Row label="Anti Permission Abuse" hint="monitor and block dangerous permission changes">
          <Toggle checked={config.enabled} onChange={v => u('enabled', v)} disabled={dis} />
        </Row>
      </Card>

      {/* monitoring */}
      <Card>
        <SectionHeader icon={<Shield size={16} />} title="Monitoring" />
        <Row label="Monitor all role changes" hint="track creation, updates, and assignments">
          <Toggle checked={allMonitoring} onChange={toggleAllMonitoring} disabled={dis} />
        </Row>
        <Row label="Monitor bots" hint="also watch actions performed by bots">
          <Toggle checked={config.monitorBots} onChange={v => u('monitorBots', v)} disabled={dis} />
        </Row>
      </Card>

      {/* punishment */}
      <Card>
        <SectionHeader title="Punishment" />
        <CheckboxGroup
          options={punishmentOpts}
          selected={config.punishmentActions}
          onChange={v => u('punishmentActions', v)}
          disabled={dis}
        />
        <div className="mt-2">
          <Row label="Strip executor roles" hint="remove all roles from the abuser">
            <Toggle checked={config.stripExecutorRoles} onChange={v => u('stripExecutorRoles', v)} disabled={dis} />
          </Row>
        </div>
      </Card>

      {/* notifications */}
      <Card>
        <Row label="Notify owner via DM">
          <Toggle checked={config.notifyOwner} onChange={v => u('notifyOwner', v)} disabled={dis} />
        </Row>
        <Row label="Log channel">
          <input
            type="text"
            placeholder="channel id"
            value={config.logChannelId || ''}
            onChange={e => u('logChannelId', e.target.value || null)}
            disabled={dis}
            className="w-44 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/70 placeholder-white/20 focus:outline-none focus:border-[#5865F2]/50 transition-colors disabled:opacity-40"
          />
        </Row>
      </Card>

      {/* advanced */}
      <div className="flex justify-center">
        <AdvancedToggle open={advanced} onToggle={() => setAdvanced(!advanced)} />
      </div>

      {advanced && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* individual monitor toggles */}
          <Card>
            <SectionHeader title="Individual Monitors" />
            <Row label="Role creation"><Toggle checked={config.monitorRoleCreation} onChange={v => u('monitorRoleCreation', v)} disabled={dis} /></Row>
            <Row label="Role updates"><Toggle checked={config.monitorRoleUpdates} onChange={v => u('monitorRoleUpdates', v)} disabled={dis} /></Row>
            <Row label="Role assignments"><Toggle checked={config.monitorRoleAssignments} onChange={v => u('monitorRoleAssignments', v)} disabled={dis} /></Row>
          </Card>

          {/* dangerous permissions */}
          <Card>
            <SectionHeader title="Dangerous Permissions" />
            <CheckboxGroup
              options={permissionOpts}
              selected={config.dangerousPermissions}
              onChange={v => u('dangerousPermissions', v)}
              disabled={dis}
            />
          </Card>

          {/* timing */}
          <Card>
            <Row label="Timeout duration"><NumberInput value={config.timeoutDuration} onChange={v => u('timeoutDuration', v)} min={60} max={2419200} suffix="sec" disabled={dis} /></Row>
            <Row label="Punishment cooldown"><NumberInput value={config.punishmentCooldown} onChange={v => u('punishmentCooldown', v)} min={1} max={3600} suffix="sec" disabled={dis} /></Row>
            <Row label="Audit log cache"><NumberInput value={config.auditLogCacheDuration} onChange={v => u('auditLogCacheDuration', v)} min={1} max={3600} suffix="sec" disabled={dis} /></Row>
            <Row label="Audit log timeout"><NumberInput value={config.auditLogTimeout} onChange={v => u('auditLogTimeout', v)} min={1000} max={30000} suffix="ms" disabled={dis} /></Row>
          </Card>

          {/* notifications */}
          <Card>
            <SectionHeader title="Notification Details" />
            <Row label="Log actions"><Toggle checked={config.logActions} onChange={v => u('logActions', v)} disabled={dis} /></Row>
            <Row label="Notify on permission failure"><Toggle checked={config.notifyOnPermissionFailure} onChange={v => u('notifyOnPermissionFailure', v)} disabled={dis} /></Row>
            <Row label="Notify on duplicates"><Toggle checked={config.notifyOnDuplicates} onChange={v => u('notifyOnDuplicates', v)} disabled={dis} /></Row>
          </Card>

          {/* trust */}
          <Card>
            <SectionHeader title="Trust Settings" />
            <Row label="Bypass trusted users/roles"><Toggle checked={config.bypassTrusted} onChange={v => u('bypassTrusted', v)} disabled={dis} /></Row>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
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