'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';
import { Shield, RotateCcw, Zap } from 'lucide-react';
import {
  Toggle, Card, Row, SectionHeader, Select, NumberInput, Slider,
  IdList, CheckboxGroup, SaveBar, ConfigLoading, AdvancedToggle, promptId
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
  { value: 'remove_roles', label: 'Strip Roles' },
  { value: 'timeout', label: 'Timeout' },
  { value: 'kick', label: 'Kick' },
  { value: 'ban', label: 'Ban' },
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
      onSave?.(false, `wait ${Math.ceil((15000 - (now - lastSave)) / 1000)}s`);
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
        onSave?.(true, 'anti-nuke config saved');
      } else throw new Error();
    } catch { onSave?.(false, 'failed to save'); }
    finally { setSaving(false); }
  };

  const u = <K extends keyof AntiNukeConfig>(k: K, v: AntiNukeConfig[K]) =>
    setConfig(p => ({ ...p, [k]: v }));

  if (loading) return <ConfigLoading />;

  const preset = detectPreset(config);
  const dis = saving;

  return (
    <div className="space-y-4">
      {/* module on/off */}
      <Card>
        <Row label="Anti-Nuke Protection" hint="master switch for all anti-nuke features">
          <Toggle checked={config.enabled} onChange={v => u('enabled', v)} disabled={dis} />
        </Row>
      </Card>

      {/* protection level */}
      <Card>
        <SectionHeader icon={<Shield size={16} />} title="Protection Level" />
        <div className="grid grid-cols-4 gap-2">
          {(['low', 'medium', 'high', 'max'] as const).map(level => (
            <button
              key={level}
              onClick={() => setConfig(p => ({ ...p, ...presets[level] }))}
              disabled={dis}
              className={`py-2.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 border ${preset === level
                  ? 'bg-[#5865F2]/15 border-[#5865F2]/30 text-[#5865F2]'
                  : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/10'
                }`}
            >
              {level}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <p className="text-xs text-white/20 mt-2">custom thresholds — use advanced mode to edit</p>
        )}
      </Card>

      {/* punishment */}
      <Card>
        <SectionHeader icon={<Zap size={16} />} title="Punishment" />
        <CheckboxGroup
          options={punishmentOpts}
          selected={config.userPunishmentActions}
          onChange={v => u('userPunishmentActions', v)}
          disabled={dis}
        />
        <div className="mt-3">
          <Row label="Auto-ban malicious bots" hint="instantly ban bot accounts that trigger protection">
            <Toggle checked={config.botAutoban} onChange={v => u('botAutoban', v)} disabled={dis} />
          </Row>
        </div>
      </Card>

      {/* rollback */}
      <Card>
        <SectionHeader icon={<RotateCcw size={16} />} title="Auto-Restore" />
        <Row label="Automatic rollback" hint="restore deleted channels, roles, and emojis after an attack">
          <Toggle checked={config.enableRollback} onChange={v => u('enableRollback', v)} disabled={dis} />
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

      {/* advanced mode */}
      <div className="flex justify-center">
        <AdvancedToggle open={advanced} onToggle={() => setAdvanced(!advanced)} />
      </div>

      {advanced && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* thresholds */}
          <Card>
            <SectionHeader title="Destruction Thresholds" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Row label="Channels deleted"><NumberInput value={config.channelDeleteThreshold} onChange={v => u('channelDeleteThreshold', v)} min={1} max={20} disabled={dis} /></Row>
              <Row label="Roles deleted"><NumberInput value={config.roleDeleteThreshold} onChange={v => u('roleDeleteThreshold', v)} min={1} max={20} disabled={dis} /></Row>
              <Row label="Members banned"><NumberInput value={config.banThreshold} onChange={v => u('banThreshold', v)} min={1} max={20} disabled={dis} /></Row>
              <Row label="Members kicked"><NumberInput value={config.kickThreshold} onChange={v => u('kickThreshold', v)} min={1} max={30} disabled={dis} /></Row>
              <Row label="Webhooks created"><NumberInput value={config.webhookCreateThreshold} onChange={v => u('webhookCreateThreshold', v)} min={1} max={20} disabled={dis} /></Row>
              <Row label="Emojis deleted"><NumberInput value={config.emojiDeleteThreshold} onChange={v => u('emojiDeleteThreshold', v)} min={1} max={50} disabled={dis} /></Row>
              <Row label="Stickers deleted"><NumberInput value={config.stickerDeleteThreshold} onChange={v => u('stickerDeleteThreshold', v)} min={1} max={50} disabled={dis} /></Row>
              <Row label="Time window"><NumberInput value={config.timeWindow} onChange={v => u('timeWindow', v)} min={10} max={300} suffix="sec" disabled={dis} /></Row>
            </div>
          </Card>

          {/* rapid fire */}
          <Card>
            <Row label="Rapid-fire detection" hint="instant punishment for extremely fast attacks">
              <Toggle checked={config.rapidFireEnabled} onChange={v => u('rapidFireEnabled', v)} disabled={dis} />
            </Row>
            {config.rapidFireEnabled && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
                <Row label="Threshold"><NumberInput value={config.rapidFireThreshold} onChange={v => u('rapidFireThreshold', v)} min={1} max={10} disabled={dis} /></Row>
                <Row label="Window"><NumberInput value={config.rapidFireWindow} onChange={v => u('rapidFireWindow', v)} min={100} max={5000} step={100} suffix="ms" disabled={dis} /></Row>
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
            <Row label="Timeout duration"><NumberInput value={config.timeoutDuration} onChange={v => u('timeoutDuration', v)} min={60} max={2419200} suffix="sec" disabled={dis} /></Row>
          </Card>

          {/* rollback details */}
          <Card>
            <SectionHeader title="Rollback Details" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Row label="Recover channels"><Toggle checked={config.rollbackChannels} onChange={v => u('rollbackChannels', v)} disabled={dis || !config.enableRollback} /></Row>
              <Row label="Recover roles"><Toggle checked={config.rollbackRoles} onChange={v => u('rollbackRoles', v)} disabled={dis || !config.enableRollback} /></Row>
              <Row label="Recover emojis"><Toggle checked={config.rollbackEmojis} onChange={v => u('rollbackEmojis', v)} disabled={dis || !config.enableRollback} /></Row>
              <Row label="Backup retention"><NumberInput value={config.backupRetentionHours} onChange={v => u('backupRetentionHours', v)} min={1} max={168} suffix="hrs" disabled={dis} /></Row>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              <div><span className="text-[10px] text-white/20 block mb-1">ch backups</span><NumberInput value={config.maxChannelBackups} onChange={v => u('maxChannelBackups', v)} min={5} max={100} disabled={dis} /></div>
              <div><span className="text-[10px] text-white/20 block mb-1">role backups</span><NumberInput value={config.maxRoleBackups} onChange={v => u('maxRoleBackups', v)} min={10} max={200} disabled={dis} /></div>
              <div><span className="text-[10px] text-white/20 block mb-1">emoji backups</span><NumberInput value={config.maxEmojiBackups} onChange={v => u('maxEmojiBackups', v)} min={20} max={500} disabled={dis} /></div>
              <div><span className="text-[10px] text-white/20 block mb-1">sticker backups</span><NumberInput value={config.maxStickerBackups} onChange={v => u('maxStickerBackups', v)} min={20} max={500} disabled={dis} /></div>
            </div>
          </Card>

          {/* trust / logging */}
          <Card>
            <SectionHeader title="Trust & Logging" />
            <Row label="Bypass trusted users/roles"><Toggle checked={config.bypassTrusted} onChange={v => u('bypassTrusted', v)} disabled={dis} /></Row>
            <Row label="Log actions"><Toggle checked={config.logActions} onChange={v => u('logActions', v)} disabled={dis} /></Row>
            <Row label="Audit log cache"><NumberInput value={config.auditLogCacheDuration} onChange={v => u('auditLogCacheDuration', v)} min={500} max={10000} step={500} suffix="ms" disabled={dis} /></Row>
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