'use client';

import { useState, useEffect } from 'react';
import { useConfigCache } from '../../hooks/useConfigCache';
import { MessageSquare, Link, Image, Webhook } from 'lucide-react';
import {
    Toggle, Card, Row, SectionHeader, Select, NumberInput,
    IdList, StringList, SaveBar, ConfigLoading, AdvancedToggle, promptId
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
    blockedDomains: ['discord.gg', 'discordapp.com/invite', 'bit.ly', 'tinyurl.com', 'grabify.link'],
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
    { value: 'timeout', label: 'Timeout' },
    { value: 'kick', label: 'Kick' },
    { value: 'ban', label: 'Ban' },
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
            const res = await fetch('/api/antispam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guildId: selectedGuild, config }),
            });
            if (res.ok) {
                setCached(`antispam-${selectedGuild}`, config);
                setLastSave(now);
                onSave?.(true, 'anti-spam config saved');
            } else throw new Error();
        } catch { onSave?.(false, 'failed to save'); }
        finally { setSaving(false); }
    };

    const u = <K extends keyof AntiSpamConfig>(k: K, v: AntiSpamConfig[K]) =>
        setConfig(p => ({ ...p, [k]: v }));

    if (loading) return <ConfigLoading />;
    const dis = saving;

    return (
        <div className="space-y-4">
            {/* on/off */}
            <Card>
                <Row label="Anti-Spam" hint="detect and block spam across messages, links, images, and webhooks">
                    <Toggle checked={config.enabled} onChange={v => u('enabled', v)} disabled={dis} />
                </Row>
            </Card>

            {/* spam types */}
            <Card>
                <SectionHeader icon={<MessageSquare size={16} />} title="Spam Detection" />
                <Row label="Message spam" hint="rapid messages from the same user">
                    <Toggle checked={config.messageSpamEnabled} onChange={v => u('messageSpamEnabled', v)} disabled={dis} />
                </Row>
                <Row label="Link spam" hint="suspicious or blocked links">
                    <Toggle checked={config.linkSpamEnabled} onChange={v => u('linkSpamEnabled', v)} disabled={dis} />
                </Row>
                <Row label="Webhook spam" hint="spam from webhooks">
                    <Toggle checked={config.webhookSpamEnabled} onChange={v => u('webhookSpamEnabled', v)} disabled={dis} />
                </Row>
                <Row label="Image/GIF spam" hint="rapid image posting">
                    <Toggle checked={config.imageSpamEnabled} onChange={v => u('imageSpamEnabled', v)} disabled={dis} />
                </Row>
            </Card>

            {/* punishment */}
            <Card>
                <Row label="Punishment" hint="action after max strikes">
                    <Select value={config.punishmentType} onChange={v => u('punishmentType', v)} options={punishmentOpts} disabled={dis} />
                </Row>
                <Row label="Auto-delete spam messages">
                    <Toggle checked={config.deleteSpamMessages} onChange={v => u('deleteSpamMessages', v)} disabled={dis} />
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
                    {/* message spam details */}
                    <Card>
                        <SectionHeader icon={<MessageSquare size={14} />} title="Message Spam" />
                        <Row label="Message threshold"><NumberInput value={config.messageCount} onChange={v => u('messageCount', v)} min={1} max={50} disabled={dis} /></Row>
                        <Row label="Time window"><NumberInput value={config.messageTimeWindow} onChange={v => u('messageTimeWindow', v)} min={1} max={60} suffix="sec" disabled={dis} /></Row>
                    </Card>

                    {/* link spam details */}
                    <Card>
                        <SectionHeader icon={<Link size={14} />} title="Link Spam" />
                        <Row label="Link action">
                            <Select value={config.linkAction} onChange={v => u('linkAction', v)} options={[
                                { value: 'warn', label: 'Warn first' },
                                { value: 'instant', label: 'Instant action' },
                            ]} disabled={dis} />
                        </Row>
                        <Row label="Block all links"><Toggle checked={config.blockAllLinks} onChange={v => u('blockAllLinks', v)} disabled={dis} /></Row>
                        <div className="mt-2">
                            <span className="text-xs text-white/40 block mb-1.5">blocked domains</span>
                            <StringList items={config.blockedDomains} onChange={v => u('blockedDomains', v)} placeholder="add domain" disabled={dis} />
                        </div>
                    </Card>

                    {/* image spam details */}
                    <Card>
                        <SectionHeader icon={<Image size={14} />} title="Image/GIF Spam" />
                        <Row label="Image threshold"><NumberInput value={config.imageCount} onChange={v => u('imageCount', v)} min={1} max={50} disabled={dis} /></Row>
                        <Row label="Time window"><NumberInput value={config.imageTimeWindow} onChange={v => u('imageTimeWindow', v)} min={1} max={60} suffix="sec" disabled={dis} /></Row>
                    </Card>

                    {/* webhook spam details */}
                    <Card>
                        <SectionHeader icon={<Webhook size={14} />} title="Webhook Spam" />
                        <Row label="Message threshold"><NumberInput value={config.webhookMessageCount} onChange={v => u('webhookMessageCount', v)} min={1} max={50} disabled={dis} /></Row>
                        <Row label="Time window"><NumberInput value={config.webhookTimeWindow} onChange={v => u('webhookTimeWindow', v)} min={1} max={60} suffix="sec" disabled={dis} /></Row>
                    </Card>

                    {/* strikes */}
                    <Card>
                        <SectionHeader title="Strike System" />
                        <Row label="Max strikes before punishment"><NumberInput value={config.maxStrikes} onChange={v => u('maxStrikes', v)} min={1} max={20} disabled={dis} /></Row>
                        <Row label="Strike expiry"><NumberInput value={config.strikeExpiry} onChange={v => u('strikeExpiry', v)} min={60} max={86400} suffix="sec" disabled={dis} /></Row>
                        <Row label="Timeout duration"><NumberInput value={config.timeoutDuration} onChange={v => u('timeoutDuration', v)} min={60} max={2419200} suffix="sec" disabled={dis} /></Row>
                    </Card>

                    {/* warnings */}
                    <Card>
                        <SectionHeader title="Warnings" />
                        <Row label="Warn in channel"><Toggle checked={config.sendWarningInChannel} onChange={v => u('sendWarningInChannel', v)} disabled={dis} /></Row>
                        <Row label="Warn via DM"><Toggle checked={config.sendWarningDM} onChange={v => u('sendWarningDM', v)} disabled={dis} /></Row>
                        <Row label="Auto-delete warning after"><NumberInput value={config.deleteWarningAfter} onChange={v => u('deleteWarningAfter', v)} min={1} max={60} suffix="sec" disabled={dis} /></Row>
                    </Card>

                    {/* trust */}
                    <Card>
                        <SectionHeader title="Trust Settings" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
