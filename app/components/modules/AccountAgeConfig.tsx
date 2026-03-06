'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';
import { Clock } from 'lucide-react';
import {
  Toggle, Card, Row, SectionHeader, Select, Slider, NumberInput,
  IdList, SaveBar, ConfigLoading, AdvancedToggle, promptId
} from './ui';

// --- types (matches api + aero bot) ---
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

const defaultConfig: AccountAgeConfig = {
  enabled: true,
  minAccountAge: 7,
  action: 'none',
  timeoutDuration: 600,
  logChannelId: null,
  trustedUsers: [],
  trustedRoles: [],
  bypassTrusted: true,
  logActions: true,
  debug: false
};

const actionOpts = [
  { value: 'none', label: 'Notify Only' },
  { value: 'kick', label: 'Kick' },
  { value: 'ban', label: 'Ban' },
  { value: 'timeout', label: 'Timeout' },
];

export const moduleInfo = {
  id: 'account-age-protection',
  name: 'Account Age Protection',
  description: 'Protect against new/suspicious accounts',
  category: 'security',
};

export default function AccountAgeConfig({ selectedGuild, onSave }: {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}) {
  const [config, setConfig] = useState<AccountAgeConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [lastSave, setLastSave] = useState(0);
  const { getCached, setCached } = useConfigCache();

  useEffect(() => { if (selectedGuild) loadConfig(); }, [selectedGuild]);

  const loadConfig = async () => {
    const key = `age-${selectedGuild}`;
    const cached = getCached(key);
    if (cached) { setConfig(cached); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/account-age-protection?guildId=${selectedGuild}`);
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
      const res = await fetch('/api/account-age-protection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: selectedGuild, config }),
      });
      if (res.ok) {
        setCached(`age-${selectedGuild}`, config);
        setLastSave(now);
        onSave?.(true, 'account age config saved');
      } else throw new Error();
    } catch { onSave?.(false, 'failed to save'); }
    finally { setSaving(false); }
  };

  const u = <K extends keyof AccountAgeConfig>(k: K, v: AccountAgeConfig[K]) =>
    setConfig(p => ({ ...p, [k]: v }));

  const formatDays = (d: number) => d >= 30 ? `${Math.floor(d / 30)} month${d >= 60 ? 's' : ''}` : `${d} day${d !== 1 ? 's' : ''}`;

  if (loading) return <ConfigLoading />;
  const dis = saving;

  return (
    <div className="space-y-4">
      <Card>
        <Row label="Account Age Protection" hint="flag or block accounts that are too new">
          <Toggle checked={config.enabled} onChange={v => u('enabled', v)} disabled={dis} />
        </Row>
      </Card>

      {/* age threshold */}
      <Card>
        <SectionHeader icon={<Clock size={16} />} title="Age Threshold" />
        <Row label={`Minimum age — ${formatDays(config.minAccountAge)}`} hint="accounts younger than this trigger the action">
          <Slider value={config.minAccountAge} onChange={v => u('minAccountAge', v)} min={1} max={90} label={formatDays(config.minAccountAge)} disabled={dis} />
        </Row>
      </Card>

      {/* action */}
      <Card>
        <Row label="Action to take" hint="what happens when a young account joins">
          <Select value={config.action} onChange={v => u('action', v)} options={actionOpts} disabled={dis} />
        </Row>
        {config.action === 'timeout' && (
          <Row label="Timeout duration">
            <NumberInput value={config.timeoutDuration} onChange={v => u('timeoutDuration', v)} min={60} max={2419200} suffix="sec" disabled={dis} />
          </Row>
        )}
      </Card>

      {/* log channel */}
      <Card>
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
            <Row label="Bypass trusted users/roles"><Toggle checked={config.bypassTrusted} onChange={v => u('bypassTrusted', v)} disabled={dis} /></Row>
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