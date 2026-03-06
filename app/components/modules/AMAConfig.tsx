'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';
import { Shield } from 'lucide-react';
import {
  Toggle, Card, Row, SectionHeader, Slider, NumberInput,
  IdList, CheckboxGroup, SaveBar, ConfigLoading, AdvancedToggle, promptId
} from './ui';

// --- types (matches api) ---
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

const punishmentOpts = [
  { value: 'remove_roles', label: 'Strip Roles' },
  { value: 'timeout', label: 'Timeout' },
  { value: 'kick', label: 'Kick' },
  { value: 'ban', label: 'Ban' },
  { value: 'notify', label: 'Notify Only' },
];

export const moduleInfo = {
  id: 'anti-mass-action',
  name: 'Anti Mass Action',
  description: 'Protect against mass kicks, bans and admin power trips',
  category: 'moderation',
};

export default function AMAConfig({ selectedGuild, onSave }: {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}) {
  const [config, setConfig] = useState<AMAConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [lastSave, setLastSave] = useState(0);
  const { getCached, setCached } = useConfigCache();

  useEffect(() => { if (selectedGuild) loadConfig(); }, [selectedGuild]);

  const loadConfig = async () => {
    const key = `ama-${selectedGuild}`;
    const cached = getCached(key);
    if (cached) { setConfig(cached); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/ama-config?guildId=${selectedGuild}`);
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
      const res = await fetch('/api/ama-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: selectedGuild, config }),
      });
      if (res.ok) {
        setCached(`ama-${selectedGuild}`, config);
        setLastSave(now);
        onSave?.(true, 'mass action config saved');
      } else throw new Error();
    } catch { onSave?.(false, 'failed to save'); }
    finally { setSaving(false); }
  };

  const u = <K extends keyof AMAConfig>(k: K, v: AMAConfig[K]) =>
    setConfig(p => ({ ...p, [k]: v }));

  if (loading) return <ConfigLoading />;
  const dis = saving;

  return (
    <div className="space-y-4">
      <Card>
        <Row label="Anti Mass Action" hint="detect and stop mass kicks/bans from rogue admins">
          <Toggle checked={config.enabled} onChange={v => u('enabled', v)} disabled={dis} />
        </Row>
      </Card>

      {/* limits */}
      <Card>
        <SectionHeader icon={<Shield size={16} />} title="Action Limits" />
        <Row label={`Kick limit — ${config.kickThreshold}`} hint="kicks within time window before action">
          <Slider value={config.kickThreshold} onChange={v => u('kickThreshold', v)} min={1} max={20} label={`${config.kickThreshold}`} disabled={dis} />
        </Row>
        <Row label={`Ban limit — ${config.banThreshold}`} hint="bans within time window before action">
          <Slider value={config.banThreshold} onChange={v => u('banThreshold', v)} min={1} max={20} label={`${config.banThreshold}`} disabled={dis} />
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
          <Card>
            <Row label="Time window"><NumberInput value={config.timeWindow} onChange={v => u('timeWindow', v)} min={60} max={3600} suffix="sec" disabled={dis} /></Row>
            <Row label="Timeout duration"><NumberInput value={config.timeoutDuration} onChange={v => u('timeoutDuration', v)} min={60} max={2419200} suffix="sec" disabled={dis} /></Row>
            <Row label="Bypass trusted"><Toggle checked={config.bypassTrusted} onChange={v => u('bypassTrusted', v)} disabled={dis} /></Row>
            <Row label="Log actions"><Toggle checked={config.logActions} onChange={v => u('logActions', v)} disabled={dis} /></Row>
          </Card>

          <Card>
            <SectionHeader title="Trust Settings" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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