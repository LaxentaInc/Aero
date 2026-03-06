'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';
import { MessageSquare, Link, Image, Webhook, Zap, Shield } from 'lucide-react';
import {
    Toggle, Card, Row, SectionHeader, Select, NumberInput,
    IdList, StringList, SaveBar, ConfigLoading, AdvancedToggle, promptId, MasterToggle
} from './ui';

// --- types (matches api + aero bot antispam/config.js) ---
interface AntiSpamConfig {
    enabled: boolean;
    messageSpamEnabled: boolean;
    messageCount: number;
    messageTimeWindow: number;
    linkSpamEnabled: boolean;
    linkAction: string;
    blockAllLinks: boolean;
    blockedDomains: string[];
    imageSpamEnabled: boolean;
    imageCount: number;
    imageTimeWindow: number;
    webhookSpamEnabled: boolean;
    webhookMessageCount: number;
    webhookTimeWindow: number;
    punishmentType: string;
    timeoutDuration: number;
    maxStrikes: number;
    strikeExpiry: number;
    sendWarningInChannel: boolean;
    sendWarningDM: boolean;
    deleteWarningAfter: number;
    trustedUsers: string[];
    trustedRoles: string[];
    bypassRoles: string[];
    notifyOwner: boolean;
    logChannelId: string | null;
    deleteSpamMessages: boolean;
}

const defaultConfig: AntiSpamConfig = {
    enabled: true,
    messageSpamEnabled: true,
    messageCount: 3,
    messageTimeWindow: 3,
    linkSpamEnabled: true,
    linkAction: 'warn',
    blockAllLinks: false,
    blockedDomains: ['discord.gg', 'grabify.link', 'iplogger.org', 'bit.ly', 'tinyurl.com'],
    imageSpamEnabled: false,
    imageCount: 3,
    imageTimeWindow: 5,
    webhookSpamEnabled: true,
    webhookMessageCount: 3,
    webhookTimeWindow: 5,
    punishmentType: 'timeout',
    timeoutDuration: 300,
    maxStrikes: 3,
    strikeExpiry: 10800,
    sendWarningInChannel: true,
    sendWarningDM: true,
    deleteWarningAfter: 3,
    trustedUsers: [],
    trustedRoles: [],
    bypassRoles: [],
    notifyOwner: true,
    logChannelId: null,
    deleteSpamMessages: true,
};

const punishmentOpts = [
    { value: 'timeout', label: 'TIMEOUT' },
    { value: 'kick', label: 'KICK' },
    { value: 'ban', label: 'BAN' },
];

export const moduleInfo = {
    id: 'antispam',
    name: 'Anti-Spam',
    description: 'Detect and block message, link, image, and webhook spam',
    category: 'moderation',
};

export default function AntiSpamConfig({ selectedGuild, onSave }: {
    selectedGuild: string;
    onSave?: (success: boolean, message: string) => void;
}) {
    const [config, setConfig] = useState<AntiSpamConfig>(defaultConfig);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [advanced, setAdvanced] = useState(false);
    const [lastSave, setLastSave] = useState(0);
    const { getCached, setCached } = useConfigCache();

    useEffect(() => { if (selectedGuild) loadConfig(); }, [selectedGuild]);

    const loadConfig = async () => {
        const key = `antispam-${selectedGuild}`;
        const cached = getCached(key);
        if (cached) { setConfig(cached); return; }

        setLoading(true);
        try {
            const res = await fetch(`/api/antispam?guildId=${selectedGuild}`);
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
            const res = await fetch('/api/antispam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guildId: selectedGuild, config }),
            });
            if (res.ok) {
                setCached(`antispam-${selectedGuild}`, config);
                setLastSave(now);
                onSave?.(true, 'Anti-Spam configuration saved.');
            } else throw new Error();
        } catch { onSave?.(false, 'Failed to save configuration.'); }
        finally { setSaving(false); }
    };

    const u = <K extends keyof AntiSpamConfig>(k: K, v: AntiSpamConfig[K]) =>
        setConfig(p => ({ ...p, [k]: v }));

    if (loading) return <ConfigLoading />;
    const dis = saving;

    return (
        <div className="space-y-6 pb-24">
            {/* master toggle */}
            <MasterToggle
                label="Enable Anti-Spam"
                checked={config.enabled}
                onChange={v => u('enabled', v)}
                disabled={dis}
            />

            <div className={`space-y-6 transition-all duration-500 ${!config.enabled ? 'opacity-50 pointer-events-none grayscale-[0.2]' : ''}`}>
                {/* spam types */}
                <Card>
                    <SectionHeader icon={<MessageSquare size={20} />} title="Spam Detection Layers" />
                    <Row label="Message Flooding" hint="Detect users rapidly sending the same or similar messages in quick succession.">
                        <Toggle checked={config.messageSpamEnabled} onChange={v => u('messageSpamEnabled', v)} disabled={dis} />
                    </Row>
                    <Row label="Link Spam" hint="Block suspicious, phishing, or invite links from untrusted users.">
                        <Toggle checked={config.linkSpamEnabled} onChange={v => u('linkSpamEnabled', v)} disabled={dis} />
                    </Row>
                    <Row label="Webhook Spam" hint="Detect compromised or rogue webhooks flooding channels with messages.">
                        <Toggle checked={config.webhookSpamEnabled} onChange={v => u('webhookSpamEnabled', v)} disabled={dis} />
                    </Row>
                    <Row label="Image / GIF Spam" hint="Flag users sending bursts of images or animated GIFs.">
                        <Toggle checked={config.imageSpamEnabled} onChange={v => u('imageSpamEnabled', v)} disabled={dis} />
                    </Row>
                </Card>

                {/* punishment */}
                <Card>
                    <SectionHeader icon={<Zap size={20} />} title="Enforcement" />
                    <Row label="Punishment Type" hint="The action taken when a user exceeds the maximum strike count.">
                        <Select value={config.punishmentType} onChange={v => u('punishmentType', v)} options={punishmentOpts} disabled={dis} />
                    </Row>
                    <Row label="Auto-Delete Spam" hint="Instantly purge messages identified as spam from the channel.">
                        <Toggle checked={config.deleteSpamMessages} onChange={v => u('deleteSpamMessages', v)} disabled={dis} />
                    </Row>
                </Card>

                {/* notifications */}
                <Card>
                    <Row label="Notify Owner via DM" hint="Alert the server owner via direct message when spam is detected.">
                        <Toggle checked={config.notifyOwner} onChange={v => u('notifyOwner', v)} disabled={dis} />
                    </Row>
                    <Row label="Log Channel ID">
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
                    {/* message spam tuning */}
                    <Card>
                        <SectionHeader icon={<MessageSquare size={20} />} title="Message Flood Tuning" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            <Row label="Message Threshold"><NumberInput value={config.messageCount} onChange={v => u('messageCount', v)} min={1} max={50} disabled={dis} /></Row>
                            <Row label="Time Window"><NumberInput value={config.messageTimeWindow} onChange={v => u('messageTimeWindow', v)} min={1} max={60} suffix="sec" disabled={dis} /></Row>
                        </div>
                    </Card>

                    {/* link spam tuning */}
                    <Card>
                        <SectionHeader icon={<Link size={20} />} title="Link Spam Control" />
                        <Row label="Link Action Mode">
                            <Select value={config.linkAction} onChange={v => u('linkAction', v)} options={[
                                { value: 'warn', label: 'Warn First' },
                                { value: 'instant', label: 'Instant Delete' },
                            ]} disabled={dis} />
                        </Row>
                        <Row label="Block ALL Links" hint="Nuclear option — delete every external link posted by non-trusted users.">
                            <Toggle checked={config.blockAllLinks} onChange={v => u('blockAllLinks', v)} disabled={dis} />
                        </Row>
                        <div className="pt-6 mt-4 border-t border-white/[0.03]">
                            <p className="text-sm font-bold text-white/50 mb-3 uppercase tracking-widest">Blocked Domain Blacklist</p>
                            <StringList items={config.blockedDomains} onChange={v => u('blockedDomains', v)} placeholder="e.g. grabify.link" disabled={dis} />
                        </div>
                    </Card>

                    {/* image spam tuning */}
                    <Card>
                        <SectionHeader icon={<Image size={20} />} title="Image / GIF Spam" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            <Row label="Image Threshold"><NumberInput value={config.imageCount} onChange={v => u('imageCount', v)} min={1} max={50} disabled={dis} /></Row>
                            <Row label="Time Window"><NumberInput value={config.imageTimeWindow} onChange={v => u('imageTimeWindow', v)} min={1} max={60} suffix="sec" disabled={dis} /></Row>
                        </div>
                    </Card>

                    {/* webhook spam tuning */}
                    <Card>
                        <SectionHeader icon={<Webhook size={20} />} title="Webhook Spam" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            <Row label="Message Threshold"><NumberInput value={config.webhookMessageCount} onChange={v => u('webhookMessageCount', v)} min={1} max={50} disabled={dis} /></Row>
                            <Row label="Time Window"><NumberInput value={config.webhookTimeWindow} onChange={v => u('webhookTimeWindow', v)} min={1} max={60} suffix="sec" disabled={dis} /></Row>
                        </div>
                    </Card>

                    {/* strike system */}
                    <Card>
                        <SectionHeader title="Strike Escalation System" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            <Row label="Max Strikes Before Punishment"><NumberInput value={config.maxStrikes} onChange={v => u('maxStrikes', v)} min={1} max={20} disabled={dis} /></Row>
                            <Row label="Strike Expiry"><NumberInput value={config.strikeExpiry} onChange={v => u('strikeExpiry', v)} min={60} max={86400} suffix="sec" disabled={dis} /></Row>
                            <Row label="Timeout Duration"><NumberInput value={config.timeoutDuration} onChange={v => u('timeoutDuration', v)} min={60} max={2419200} suffix="sec" disabled={dis} /></Row>
                        </div>
                    </Card>

                    {/* warnings */}
                    <Card>
                        <SectionHeader title="Warning Behavior" />
                        <Row label="Warn in Channel" hint="Post a visible warning in the channel where spam occurs.">
                            <Toggle checked={config.sendWarningInChannel} onChange={v => u('sendWarningInChannel', v)} disabled={dis} />
                        </Row>
                        <Row label="Warn via DM" hint="Send a direct message to the spammer.">
                            <Toggle checked={config.sendWarningDM} onChange={v => u('sendWarningDM', v)} disabled={dis} />
                        </Row>
                        <Row label="Auto-Delete Warning After" hint="Remove the channel warning after this many seconds.">
                            <NumberInput value={config.deleteWarningAfter} onChange={v => u('deleteWarningAfter', v)} min={1} max={60} suffix="sec" disabled={dis} />
                        </Row>
                    </Card>

                    {/* trust settings */}
                    <Card>
                        <SectionHeader icon={<Shield size={20} />} title="Trusted Entities" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                            <IdList ids={config.trustedUsers} onAdd={() => { const id = promptId('User'); if (id) u('trustedUsers', [...config.trustedUsers, id]); }} onRemove={id => u('trustedUsers', config.trustedUsers.filter(i => i !== id))} label="Trusted Users" disabled={dis} />
                            <IdList ids={config.trustedRoles} onAdd={() => { const id = promptId('Role'); if (id) u('trustedRoles', [...config.trustedRoles, id]); }} onRemove={id => u('trustedRoles', config.trustedRoles.filter(i => i !== id))} label="Trusted Roles" disabled={dis} />
                            <IdList ids={config.bypassRoles} onAdd={() => { const id = promptId('Role'); if (id) u('bypassRoles', [...config.bypassRoles, id]); }} onRemove={id => u('bypassRoles', config.bypassRoles.filter(i => i !== id))} label="Bypass Roles" disabled={dis} />
                        </div>
                    </Card>
                </div>
            )}

            <SaveBar onSave={saveConfig} saving={saving} disabled={!selectedGuild} />
        </div>
    );
}
