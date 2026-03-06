'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';
import { Bot } from 'lucide-react';
import {
  Toggle, Card, Row, SectionHeader, NumberInput, Slider,
  IdList, CheckboxGroup, SaveBar, ConfigLoading, AdvancedToggle, promptId
} from './ui';

// --- types (matches api + aero bot) ---
interface BotProtectionConfig {
  enabled: boolean;
  minAccountAge: number;
  checkUnverified: boolean;
  trustedUsers: string[];
  trustedRoles: string[];
  bypassTrusted: boolean;
  punishmentActions: string[];
  timeoutDuration: number;
  notifyOwner: boolean;
  logChannelId: string | null;
  logActions: boolean;
  debug: boolean;
  whitlistedBots: string[];
  autoKickBots: boolean;
  punishAdders: boolean;
}

const defaultConfig: BotProtectionConfig = {
  enabled: true,
  minAccountAge: 168,
  checkUnverified: true,
  trustedUsers: [],
  trustedRoles: [],
  bypassTrusted: true,
  punishmentActions: ['kick_bot', 'timeout_adder'],
  timeoutDuration: 3600,
  notifyOwner: true,
  logChannelId: null,
  logActions: true,
  debug: false,
  whitlistedBots: [],
  autoKickBots: true,
  punishAdders: true,
};

const punishmentOpts = [
  { value: 'kick_bot', label: 'Kick Bot' },
  { value: 'ban_bot', label: 'Ban Bot' },
  { value: 'timeout_adder', label: 'Timeout Adder' },
  { value: 'kick_adder', label: 'Kick Adder' },
  { value: 'ban_adder', label: 'Ban Adder' },
  { value: 'remove_roles_adder', label: 'Strip Adder Roles' },
  { value: 'notify', label: 'Notify Only' },
];

export const moduleInfo = {
  id: 'bot-protection',
  name: 'Bot Protection',
  description: 'Protect against suspicious bots and auto-punish bot adders',
  category: 'security',
};

const formatHours = (h: number) => h >= 24 ? `${Math.floor(h / 24)}d` : `${h}h`;

export default function BotProtectionConfig({ selectedGuild, onSave }: {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}) {
  const [config, setConfig] = useState<BotProtectionConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [lastSave, setLastSave] = useState(0);
  const { getCached, setCached } = useConfigCache();

  useEffect(() => { if (selectedGuild) loadConfig(); }, [selectedGuild]);

  const loadConfig = async () => {
    const key = `botprot-${selectedGuild}`;
    const cached = getCached(key);
    if (cached) { setConfig(cached); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/bot-protection?guildId=${selectedGuild}`);
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
      const res = await fetch('/api/bot-protection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: selectedGuild, config }),
      });
      if (res.ok) {
        setCached(`botprot-${selectedGuild}`, config);
        setLastSave(now);
        onSave?.(true, 'bot protection config saved');
      } else throw new Error();
    } catch { onSave?.(false, 'failed to save'); }
    finally { setSaving(false); }
  };

  const u = <K extends keyof BotProtectionConfig>(k: K, v: BotProtectionConfig[K]) =>
    setConfig(p => ({ ...p, [k]: v }));

  if (loading) return <ConfigLoading />;
  const dis = saving;

  return (
    <div className="space-y-4">
      <Card>
        <Row label="Bot Protection" hint="auto-kick suspicious bots and punish their adders">
          <Toggle checked={config.enabled} onChange={v => u('enabled', v)} disabled={dis} />
        </Row>
      </Card>

      {/* core toggles */}
      <Card>
        <SectionHeader icon={<Bot size={16} />} title="Protection" />
        <Row label="Auto-kick suspicious bots" hint="remove bots that look suspicious on join">
          <Toggle checked={config.autoKickBots} onChange={v => u('autoKickBots', v)} disabled={dis} />
        </Row>
        <Row label="Punish bot adders" hint="take action on the person who added the bot">
          <Toggle checked={config.punishAdders} onChange={v => u('punishAdders', v)} disabled={dis} />
        </Row>
        <Row label={`Min bot age — ${formatHours(config.minAccountAge)}`} hint="bots younger than this are flagged">
          <Slider value={config.minAccountAge} onChange={v => u('minAccountAge', v)} min={1} max={720} label={formatHours(config.minAccountAge)} disabled={dis} />
        </Row>
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
            <SectionHeader title="Punishment Actions" />
            <CheckboxGroup
              options={punishmentOpts}
              selected={config.punishmentActions}
              onChange={v => u('punishmentActions', v)}
              disabled={dis}
            />
            <div className="mt-3">
              <Row label="Timeout duration"><NumberInput value={config.timeoutDuration} onChange={v => u('timeoutDuration', v)} min={60} max={2419200} suffix="sec" disabled={dis} /></Row>
              <Row label="Check unverified bots"><Toggle checked={config.checkUnverified} onChange={v => u('checkUnverified', v)} disabled={dis} /></Row>
              <Row label="Bypass trusted"><Toggle checked={config.bypassTrusted} onChange={v => u('bypassTrusted', v)} disabled={dis} /></Row>
              <Row label="Log actions"><Toggle checked={config.logActions} onChange={v => u('logActions', v)} disabled={dis} /></Row>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Whitelisted Bots" />
            <IdList ids={config.whitlistedBots} onAdd={() => { const id = promptId('Bot'); if (id) u('whitlistedBots', [...config.whitlistedBots, id]); }} onRemove={id => u('whitlistedBots', config.whitlistedBots.filter(i => i !== id))} label="Bot IDs" addLabel="Add Bot" disabled={dis} />
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