'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';
import { Users, AlertOctagon } from 'lucide-react';
import {
  Toggle, Card, Row, SectionHeader, Select, NumberInput, Slider,
  IdList, CheckboxGroup, SaveBar, ConfigLoading, AdvancedToggle, promptId, MasterToggle
} from './ui';

// --- types (matches api + aero bot) ---
interface AMAConfig {
  enabled: boolean;
  botKickThreshold: number;
  botBanThreshold: number;
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
  botKickThreshold: 2,
  botBanThreshold: 2,
  kickThreshold: 3,
  banThreshold: 3,
  timeWindow: 120,
  trustedUsers: [],
  trustedRoles: [],
  bypassTrusted: true,
  punishmentActions: ['remove_roles', 'timeout'],
  timeoutDuration: 600,
  notifyOwner: true,
  logChannelId: null,
  logActions: true,
  debug: false,
};

const punishmentOpts = [
  { value: 'remove_roles', label: 'STRIP ROLES' },
  { value: 'timeout', label: 'TIMEOUT' },
  { value: 'kick', label: 'KICK' },
  { value: 'ban', label: 'BAN' },
];

export const moduleInfo = {
  id: 'anti-mass-action',
  name: 'Anti Mass Action (AMA)',
  description: 'Detects and stops mass kicking/banning by rogue admins or hijacked bots',
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
      onSave?.(false, `Please wait ${Math.ceil((15000 - (now - lastSave)) / 1000)}s before saving.`);
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
        onSave?.(true, 'Anti-Mass Action configuration saved.');
      } else throw new Error();
    } catch { onSave?.(false, 'Failed to save configuration.'); }
    finally { setSaving(false); }
  };

  const u = <K extends keyof AMAConfig>(k: K, v: AMAConfig[K]) =>
    setConfig(p => ({ ...p, [k]: v }));

  if (loading) return <ConfigLoading />;
  const dis = saving;

  return (
    <div className="space-y-6 pb-24">
      <MasterToggle
        label="Enable Anti-Mass Action"
        checked={config.enabled}
        onChange={v => u('enabled', v)}
        disabled={dis}
      />

      <div className={`space-y-6 transition-all duration-500 ${!config.enabled ? 'opacity-50 pointer-events-none grayscale-[0.2]' : ''}`}>
        <Card>
          <SectionHeader icon={<Users size={20} />} title="Moderation Action Limits" />
          <Row label="Human Mass Kick Limit" hint="Maximum kicks allowed within the designated time frame before punishment is executed.">
            <div className="w-1/2">
              <Slider value={config.kickThreshold} onChange={v => u('kickThreshold', v)} min={1} max={50} label={`${config.kickThreshold} Kicks`} disabled={dis} />
            </div>
          </Row>
          <div className="pt-4 mt-2 border-t border-white/[0.03]">
            <Row label="Human Mass Ban Limit" hint="Maximum bans allowed within the designated time frame before punishment is executed.">
              <div className="w-1/2">
                <Slider value={config.banThreshold} onChange={v => u('banThreshold', v)} min={1} max={50} label={`${config.banThreshold} Bans`} disabled={dis} />
              </div>
            </Row>
          </div>
        </Card>

        <Card>
          <SectionHeader icon={<AlertOctagon size={20} />} title="Punishment Actions" />
          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold text-white/50 mb-3 uppercase tracking-widest">Selected Penalties</p>
              <CheckboxGroup
                options={punishmentOpts}
                selected={config.punishmentActions}
                onChange={v => u('punishmentActions', v)}
                disabled={dis}
              />
            </div>
          </div>
        </Card>

        {/* notifications */}
        <Card>
          <Row label="Notify Owner via DM" hint="Immediately transmit severe alerts to the original Server Owner.">
            <Toggle checked={config.notifyOwner} onChange={v => u('notifyOwner', v)} disabled={dis} />
          </Row>
          <Row label="Logging Channel ID" hint="Webhook logs target ID. Leave empty for the Discord system channel.">
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
            <SectionHeader title="Granular Thresholds & Time Frames" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <Row label="Integration Kick Limit"><NumberInput value={config.botKickThreshold} onChange={v => u('botKickThreshold', v)} min={1} max={30} disabled={dis} /></Row>
              <Row label="Integration Ban Limit"><NumberInput value={config.botBanThreshold} onChange={v => u('botBanThreshold', v)} min={1} max={30} disabled={dis} /></Row>
              <Row label="Detection Time Window"><NumberInput value={config.timeWindow} onChange={v => u('timeWindow', v)} min={10} max={600} suffix="sec" disabled={dis} /></Row>
              <Row label="Timeout Penalty Duration"><NumberInput value={config.timeoutDuration} onChange={v => u('timeoutDuration', v)} min={60} max={2419200} suffix="sec" disabled={dis} /></Row>
            </div>
          </Card>

          <Card>
            <SectionHeader title="System & Logging Rules" />
            <div className="space-y-4">
              <Row label="Bypass Trusted Entities" hint="Whitelist certain accounts from tripping AMA rules.">
                <Toggle checked={config.bypassTrusted} onChange={v => u('bypassTrusted', v)} disabled={dis} />
              </Row>
              <Row label="Persist Actions to Logs" hint="Save historical audit trails of enforcement actions.">
                <Toggle checked={config.logActions} onChange={v => u('logActions', v)} disabled={dis} />
              </Row>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Trusted Whitelists" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
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