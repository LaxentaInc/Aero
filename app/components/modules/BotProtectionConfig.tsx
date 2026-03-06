'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';
import { Bot, ShieldAlert, Cpu } from 'lucide-react';
import {
  Toggle, Card, Row, SectionHeader, Select, NumberInput, Slider,
  IdList, CheckboxGroup, SaveBar, ConfigLoading, AdvancedToggle, promptId, MasterToggle
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
  whitlistedBots: string[]; // INTENTIONAL TYPO: Matches backend config schema `whitlistedBots`
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
  { value: 'kick_bot', label: 'KICK BOT' },
  { value: 'ban_bot', label: 'BAN BOT' },
  { value: 'timeout_adder', label: 'TIMEOUT ADDER' },
  { value: 'kick_adder', label: 'KICK ADDER' },
  { value: 'ban_adder', label: 'BAN ADDER' },
  { value: 'remove_roles_adder', label: 'STRIP ADDER ROLES' },
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
        setConfig({ ...defaultConfig, ...data.config });
        setCached(key, { ...defaultConfig, ...data.config });
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
      const res = await fetch('/api/bot-protection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: selectedGuild, config }),
      });
      if (res.ok) {
        setCached(`botprot-${selectedGuild}`, config);
        setLastSave(now);
        onSave?.(true, 'Bot protection config saved.');
      } else throw new Error();
    } catch { onSave?.(false, 'Failed to save configuration.'); }
    finally { setSaving(false); }
  };

  const u = <K extends keyof BotProtectionConfig>(k: K, v: BotProtectionConfig[K]) =>
    setConfig(p => ({ ...p, [k]: v }));

  if (loading) return <ConfigLoading />;
  const dis = saving;

  return (
    <div className="space-y-6 pb-24">
      <MasterToggle
        label="Enable Bot Protection"
        checked={config.enabled}
        onChange={v => u('enabled', v)}
        disabled={dis}
      />

      <div className={`space-y-6 transition-all duration-500 ${!config.enabled ? 'opacity-50 pointer-events-none grayscale-[0.2]' : ''}`}>
        {/* core toggles */}
        <Card>
          <SectionHeader icon={<Bot size={20} />} title="Automated Defense" />
          <Row label="Auto-Kick Suspicious Bots" hint="Instantly remove unverified or young bot accounts upon joining.">
            <Toggle checked={config.autoKickBots} onChange={v => u('autoKickBots', v)} disabled={dis} />
          </Row>
          <Row label="Punish Bot Adders" hint="Take automatic disciplinary action against the member who authorized the bot.">
            <Toggle checked={config.punishAdders} onChange={v => u('punishAdders', v)} disabled={dis} />
          </Row>
          <div className="pt-4 mt-2 border-t border-white/[0.03]">
            <Row label={`Minimum Bot Age — ${formatHours(config.minAccountAge)}`} hint="Bots younger than this threshold are instantly flagged as suspicious limit-testing tokens.">
              <Slider value={config.minAccountAge} onChange={v => u('minAccountAge', v)} min={1} max={720} label={formatHours(config.minAccountAge)} disabled={dis} />
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
            <SectionHeader icon={<ShieldAlert size={20} />} title="Punishment Matrix" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pt-6 mt-4 border-t border-white/[0.03]">
                <Row label="Timeout Duration"><NumberInput value={config.timeoutDuration} onChange={v => u('timeoutDuration', v)} min={60} max={2419200} suffix="sec" disabled={dis} /></Row>
                <Row label="Check Verification Badge"><Toggle checked={config.checkUnverified} onChange={v => u('checkUnverified', v)} disabled={dis} /></Row>
                <Row label="Log Actions to DB"><Toggle checked={config.logActions} onChange={v => u('logActions', v)} disabled={dis} /></Row>
                <Row label="Bypass Trusted Staff"><Toggle checked={config.bypassTrusted} onChange={v => u('bypassTrusted', v)} disabled={dis} /></Row>
              </div>
            </div>
          </Card>

          <Card>
            <SectionHeader icon={<Cpu size={20} />} title="Whitelisted Integrations" />
            <IdList ids={config.whitlistedBots} onAdd={() => { const id = promptId('Bot'); if (id) u('whitlistedBots', [...config.whitlistedBots, id]); }} onRemove={id => u('whitlistedBots', config.whitlistedBots.filter(i => i !== id))} label="Approved Bot Client IDs" addLabel="ALLOW BOT" disabled={dis} />
          </Card>

          <Card>
            <SectionHeader title="Trust Settings" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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