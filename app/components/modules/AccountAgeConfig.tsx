'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';
import { Clock, ShieldAlert, Crosshair } from 'lucide-react';
import {
  Toggle, Card, Row, SectionHeader, Select, Slider, NumberInput,
  IdList, SaveBar, ConfigLoading, AdvancedToggle, promptId, MasterToggle
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
  { value: 'none', label: 'NOTIFY ONLY' },
  { value: 'kick', label: 'KICK USER' },
  { value: 'ban', label: 'BAN USER' },
  { value: 'timeout', label: 'TIMEOUT USER' },
];

export const moduleInfo = {
  id: 'account-age-protection',
  name: 'Account Age Protection',
  description: 'Protect against new/suspicious accounts commonly used in raids',
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
      onSave?.(false, `Please wait ${Math.ceil((15000 - (now - lastSave)) / 1000)}s before saving.`);
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
        onSave?.(true, 'Account age configuration saved.');
      } else throw new Error();
    } catch { onSave?.(false, 'Failed to save configuration.'); }
    finally { setSaving(false); }
  };

  const u = <K extends keyof AccountAgeConfig>(k: K, v: AccountAgeConfig[K]) =>
    setConfig(p => ({ ...p, [k]: v }));

  const formatDays = (d: number) => d >= 30 ? `${Math.floor(d / 30)} Month${d >= 60 ? 's' : ''}` : `${d} Day${d !== 1 ? 's' : ''}`;

  if (loading) return <ConfigLoading />;
  const dis = saving;

  return (
    <div className="space-y-6 pb-24">
      <MasterToggle
        label="Enable Account Age Protection"
        checked={config.enabled}
        onChange={v => u('enabled', v)}
        disabled={dis}
      />

      <div className={`space-y-6 transition-all duration-500 ${!config.enabled ? 'opacity-50 pointer-events-none grayscale-[0.2]' : ''}`}>
        {/* age threshold */}
        <Card>
          <SectionHeader icon={<Clock size={20} />} title="Age Threshold Slider" />
          <Row label="" hint="Any user whose Discord account is younger than this limit will trigger the selected disciplinary action upon joining the server. Default is 7 days.">
            <div className="w-full">
              <Slider value={config.minAccountAge} onChange={v => u('minAccountAge', v)} min={1} max={90} label={formatDays(config.minAccountAge)} disabled={dis} />
            </div>
          </Row>
        </Card>

        {/* action */}
        <Card>
          <SectionHeader icon={<Crosshair size={20} />} title="Action on Detection" />
          <Row label="Disciplinary Action" hint="What happens when a suspicious young account attempts to join.">
            <Select value={config.action} onChange={v => u('action', v)} options={actionOpts} disabled={dis} />
          </Row>
          {config.action === 'timeout' && (
            <div className="pt-4 mt-2 border-t border-white/[0.03]">
              <Row label="Timeout Duration" hint="How long to isolate the user (in seconds).">
                <NumberInput value={config.timeoutDuration} onChange={v => u('timeoutDuration', v)} min={60} max={2419200} suffix="sec" disabled={dis} />
              </Row>
            </div>
          )}
        </Card>

        {/* notifications */}
        <Card>
          <Row label="Logging Channel ID" hint="Discord channel ID to log detections (optional).">
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
            <SectionHeader title="System Rules & Verification" />
            <div className="space-y-4">
              <Row label="Bypass Trusted Entities" hint="If enabled, trusted users and roles will not be punished even if their account is young.">
                <Toggle checked={config.bypassTrusted} onChange={v => u('bypassTrusted', v)} disabled={dis} />
              </Row>
              <Row label="Maintain Database Logs" hint="Keep a persistent history of detected young accounts.">
                <Toggle checked={config.logActions} onChange={v => u('logActions', v)} disabled={dis} />
              </Row>
            </div>
          </Card>

          <Card>
            <SectionHeader icon={<ShieldAlert size={20} />} title="Entity Whitelists" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 h-full">
              <IdList ids={config.trustedUsers} onAdd={() => { const id = promptId('User'); if (id) u('trustedUsers', [...config.trustedUsers, id]); }} onRemove={id => u('trustedUsers', config.trustedUsers.filter(i => i !== id))} label="Whitelisted Users" disabled={dis} />
              <IdList ids={config.trustedRoles} onAdd={() => { const id = promptId('Role'); if (id) u('trustedRoles', [...config.trustedRoles, id]); }} onRemove={id => u('trustedRoles', config.trustedRoles.filter(i => i !== id))} label="Whitelisted Roles" disabled={dis} />
            </div>
          </Card>
        </div>
      )}

      <SaveBar onSave={saveConfig} saving={saving} disabled={!selectedGuild} />
    </div>
  );
}