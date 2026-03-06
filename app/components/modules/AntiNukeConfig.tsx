'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';
import { Shield, RotateCcw, Zap, Settings2 } from 'lucide-react';
import {
  Toggle, Card, Row, SectionHeader, Select, NumberInput, Slider,
  IdList, CheckboxGroup, SaveBar, ConfigLoading, AdvancedToggle, promptId, MasterToggle
} from './ui';

// --- types (matches api exactly) ---
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

// protection presets for simple mode
const presets = {
  low: { channelDeleteThreshold: 5, roleDeleteThreshold: 5, webhookCreateThreshold: 5, emojiDeleteThreshold: 10, stickerDeleteThreshold: 5, banThreshold: 5, kickThreshold: 8, timeWindow: 60 },
  medium: { channelDeleteThreshold: 3, roleDeleteThreshold: 3, webhookCreateThreshold: 3, emojiDeleteThreshold: 5, stickerDeleteThreshold: 3, banThreshold: 3, kickThreshold: 5, timeWindow: 30 },
  high: { channelDeleteThreshold: 2, roleDeleteThreshold: 2, webhookCreateThreshold: 2, emojiDeleteThreshold: 3, stickerDeleteThreshold: 2, banThreshold: 2, kickThreshold: 3, timeWindow: 15 },
  max: { channelDeleteThreshold: 1, roleDeleteThreshold: 1, webhookCreateThreshold: 1, emojiDeleteThreshold: 1, stickerDeleteThreshold: 1, banThreshold: 1, kickThreshold: 1, timeWindow: 10 },
};

const detectPreset = (c: AntiNukeConfig): string => {
  for (const [name, p] of Object.entries(presets)) {
    if (Object.entries(p).every(([k, v]) => (c as any)[k] === v)) return name;
  }
  return 'custom';
};

const punishmentOpts = [
  { value: 'remove_roles', label: 'STRIP ROLES' },
  { value: 'timeout', label: 'TIMEOUT' },
  { value: 'kick', label: 'KICK' },
  { value: 'ban', label: 'BAN' },
];

export const moduleInfo = {
  id: 'antinuke',
  name: 'Anti-Nuke',
  description: 'Advanced protection against mass destructive actions and server raids',
  category: 'protection'
};

export default function AntiNukeConfig({ selectedGuild, onSave }: {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}) {
  const [config, setConfig] = useState<AntiNukeConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [lastSave, setLastSave] = useState(0);
  const { getCached, setCached } = useConfigCache();

  useEffect(() => { if (selectedGuild) loadConfig(); }, [selectedGuild]);

  const loadConfig = async () => {
    const key = `antinuke-${selectedGuild}`;
    const cached = getCached(key);
    if (cached) { setConfig(cached); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/antinuke?guildId=${selectedGuild}`);
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
      onSave?.(false, `Please wait ${Math.ceil((15000 - (now - lastSave)) / 1000)}s before saving again.`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/antinuke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: selectedGuild, config }),
      });
      if (res.ok) {
        setCached(`antinuke-${selectedGuild}`, config);
        setLastSave(now);
        onSave?.(true, 'Anti-Nuke configuration saved successfully.');
      } else throw new Error();
    } catch { onSave?.(false, 'Failed to save configuration.'); }
    finally { setSaving(false); }
  };

  const u = <K extends keyof AntiNukeConfig>(k: K, v: AntiNukeConfig[K]) =>
    setConfig(p => ({ ...p, [k]: v }));

  if (loading) return <ConfigLoading />;

  const preset = detectPreset(config);
  const dis = saving;

  return (
    <div className="space-y-6 pb-24">
      {/* master module on/off */}
      <MasterToggle
        label="Enable Anti-Nuke Protection"
        checked={config.enabled}
        onChange={v => u('enabled', v)}
        disabled={dis}
      />

      <div className={`space-y-6 transition-all duration-500 ${!config.enabled ? 'opacity-50 pointer-events-none grayscale-[0.2]' : ''}`}>
        {/* protection level */}
        <Card>
          <SectionHeader icon={<Shield size={20} />} title="Sensitivity Preset" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['low', 'medium', 'high', 'max'] as const).map(level => (
              <button
                key={level}
                onClick={() => setConfig(p => ({ ...p, ...presets[level] }))}
                disabled={dis}
                className={`py-4 rounded-xl text-sm font-black tracking-widest uppercase transition-all duration-300 border-2 ${preset === level
                  ? 'bg-[#5865F2]/20 border-[#5865F2] text-white shadow-[0_0_20px_rgba(88,101,242,0.2)] scale-105'
                  : 'bg-[#0f1419] border-white/5 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5'
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <p className="text-sm font-medium text-[#5865F2] mt-4 flex items-center gap-2">
              <Settings2 size={16} /> Custom thresholds detected. Review changes in Advanced Mode.
            </p>
          )}
        </Card>

        {/* punishment */}
        <Card>
          <SectionHeader icon={<Zap size={20} />} title="Action & Punishment" />
          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold text-white/50 mb-3 uppercase tracking-widest">Punishment for Attackers</p>
              <CheckboxGroup
                options={punishmentOpts}
                selected={config.userPunishmentActions}
                onChange={v => u('userPunishmentActions', v)}
                disabled={dis}
              />
            </div>

            <Row label="Auto-ban Malicious Bots" hint="Instantly ban unverified bots that trigger anti-nuke regardless of the punishment above.">
              <Toggle checked={config.botAutoban} onChange={v => u('botAutoban', v)} disabled={dis} />
            </Row>
          </div>
        </Card>

        {/* rollback */}
        <Card>
          <SectionHeader icon={<RotateCcw size={20} />} title="Damage Recovery" />
          <Row label="Automatic Rollback" hint="Automatically reconstruct deleted channels, roles, and emojis after an attack is neutralized.">
            <Toggle checked={config.enableRollback} onChange={v => u('enableRollback', v)} disabled={dis} />
          </Row>
        </Card>

        {/* notifications */}
        <Card>
          <Row label="DM Server Owner" hint="Send a direct message to the server owner when an attack is detected.">
            <Toggle checked={config.notifyOwner} onChange={v => u('notifyOwner', v)} disabled={dis} />
          </Row>
          <Row label="Alert Channel ID" hint="Discord channel ID where security logs will be posted (optional).">
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

      {/* advanced mode */}
      <div className="flex justify-center mt-12">
        <AdvancedToggle open={advanced} onToggle={() => setAdvanced(!advanced)} />
      </div>

      {advanced && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* thresholds */}
          <Card>
            <SectionHeader title="Granular Threshold Limits" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <Row label="Channels Deleted"><NumberInput value={config.channelDeleteThreshold} onChange={v => u('channelDeleteThreshold', v)} min={1} max={20} disabled={dis} /></Row>
              <Row label="Roles Deleted"><NumberInput value={config.roleDeleteThreshold} onChange={v => u('roleDeleteThreshold', v)} min={1} max={20} disabled={dis} /></Row>
              <Row label="Members Banned"><NumberInput value={config.banThreshold} onChange={v => u('banThreshold', v)} min={1} max={20} disabled={dis} /></Row>
              <Row label="Members Kicked"><NumberInput value={config.kickThreshold} onChange={v => u('kickThreshold', v)} min={1} max={30} disabled={dis} /></Row>
              <Row label="Webhooks Created"><NumberInput value={config.webhookCreateThreshold} onChange={v => u('webhookCreateThreshold', v)} min={1} max={20} disabled={dis} /></Row>
              <Row label="Emojis Deleted"><NumberInput value={config.emojiDeleteThreshold} onChange={v => u('emojiDeleteThreshold', v)} min={1} max={50} disabled={dis} /></Row>
              <Row label="Stickers Deleted"><NumberInput value={config.stickerDeleteThreshold} onChange={v => u('stickerDeleteThreshold', v)} min={1} max={50} disabled={dis} /></Row>
              <Row label="Time Window"><NumberInput value={config.timeWindow} onChange={v => u('timeWindow', v)} min={10} max={300} suffix="sec" disabled={dis} /></Row>
            </div>
          </Card>

          {/* rapid fire */}
          <Card>
            <SectionHeader title="Rapid-Fire Detection" />
            <Row label="Enable Rapid-Fire" hint="Instantly punish attackers performing simultaneous destructive API requests bypassing standard rate limits.">
              <Toggle checked={config.rapidFireEnabled} onChange={v => u('rapidFireEnabled', v)} disabled={dis} />
            </Row>
            {config.rapidFireEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pt-4 border-t border-white/[0.03] mt-4">
                <Row label="Actions Count"><NumberInput value={config.rapidFireThreshold} onChange={v => u('rapidFireThreshold', v)} min={1} max={10} disabled={dis} /></Row>
                <Row label="Time Window"><NumberInput value={config.rapidFireWindow} onChange={v => u('rapidFireWindow', v)} min={100} max={5000} step={100} suffix="ms" disabled={dis} /></Row>
                <Row label="Action">
                  <Select value={config.rapidFireAction} onChange={v => u('rapidFireAction', v)} options={[
                    { value: 'ban', label: 'Ban' },
                    { value: 'kick', label: 'Kick' },
                    { value: 'timeout', label: 'Timeout' },
                  ]} disabled={dis} />
                </Row>
              </div>
            )}
          </Card>

          {/* punishment details */}
          <Card>
            <SectionHeader title="Timeout Configuration" />
            <Row label="Timeout Duration" hint="Duration to isolate attacking users (in seconds). Maximum 28 days (2,419,200).">
              <NumberInput value={config.timeoutDuration} onChange={v => u('timeoutDuration', v)} min={60} max={2419200} suffix="sec" disabled={dis} />
            </Row>
          </Card>

          {/* rollback details */}
          <Card>
            <SectionHeader title="Rollback Configuration" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <Row label="Recover Channels"><Toggle checked={config.rollbackChannels} onChange={v => u('rollbackChannels', v)} disabled={dis || !config.enableRollback} /></Row>
              <Row label="Recover Roles"><Toggle checked={config.rollbackRoles} onChange={v => u('rollbackRoles', v)} disabled={dis || !config.enableRollback} /></Row>
              <Row label="Recover Emojis"><Toggle checked={config.rollbackEmojis} onChange={v => u('rollbackEmojis', v)} disabled={dis || !config.enableRollback} /></Row>
              <Row label="Backup Retention"><NumberInput value={config.backupRetentionHours} onChange={v => u('backupRetentionHours', v)} min={1} max={168} suffix="hrs" disabled={dis} /></Row>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/[0.03] mt-4">
              <div><span className="text-xs font-bold text-white/40 block mb-2 uppercase tracking-wide">Max Channels</span><NumberInput value={config.maxChannelBackups} onChange={v => u('maxChannelBackups', v)} min={5} max={100} disabled={dis} /></div>
              <div><span className="text-xs font-bold text-white/40 block mb-2 uppercase tracking-wide">Max Roles</span><NumberInput value={config.maxRoleBackups} onChange={v => u('maxRoleBackups', v)} min={10} max={200} disabled={dis} /></div>
              <div><span className="text-xs font-bold text-white/40 block mb-2 uppercase tracking-wide">Max Emojis</span><NumberInput value={config.maxEmojiBackups} onChange={v => u('maxEmojiBackups', v)} min={20} max={500} disabled={dis} /></div>
              <div><span className="text-xs font-bold text-white/40 block mb-2 uppercase tracking-wide">Max Stickers</span><NumberInput value={config.maxStickerBackups} onChange={v => u('maxStickerBackups', v)} min={20} max={500} disabled={dis} /></div>
            </div>
          </Card>

          {/* trust / logging */}
          <Card>
            <SectionHeader title="Trust & Overrides" />
            <Row label="Bypass Trusted Entities" hint="Ignore actions taken by users or roles explicitly added to the trusted lists below.">
              <Toggle checked={config.bypassTrusted} onChange={v => u('bypassTrusted', v)} disabled={dis} />
            </Row>
            <Row label="Log All Actions" hint="Keep a permanent record of all destructive actions in the database.">
              <Toggle checked={config.logActions} onChange={v => u('logActions', v)} disabled={dis} />
            </Row>
            <Row label="Audit Cache (ms)" hint="Internal caching for performance. Do not tweak unless instructed.">
              <NumberInput value={config.auditLogCacheDuration} onChange={v => u('auditLogCacheDuration', v)} min={500} max={10000} step={500} suffix="ms" disabled={dis} />
            </Row>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 mt-6 border-t border-white/[0.03]">
              <IdList ids={config.trustedUsers} onAdd={() => { const id = promptId('User'); if (id) u('trustedUsers', [...config.trustedUsers, id]); }} onRemove={id => u('trustedUsers', config.trustedUsers.filter(i => i !== id))} label="Trusted User IDs" disabled={dis} />
              <IdList ids={config.trustedRoles} onAdd={() => { const id = promptId('Role'); if (id) u('trustedRoles', [...config.trustedRoles, id]); }} onRemove={id => u('trustedRoles', config.trustedRoles.filter(i => i !== id))} label="Trusted Role IDs" disabled={dis} />
            </div>
          </Card>
        </div>
      )}

      <SaveBar onSave={saveConfig} saving={saving} disabled={!selectedGuild} />
    </div>
  );
}