import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, Collection } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// --- types ---
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

interface AntiSpamDocument {
    guildId: string;
    config: AntiSpamConfig;
    lastUpdated: Date;
    createdAt: Date;
}

// --- mongodb ---
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToMongoDB(): Promise<{ db: Db; collection: Collection<AntiSpamDocument> }> {
    if (cachedClient && cachedDb) {
        return { db: cachedDb, collection: cachedDb.collection<AntiSpamDocument>('spam_protection_config') };
    }
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set');
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('antiraid');
    cachedClient = client;
    cachedDb = db;
    return { db, collection: db.collection<AntiSpamDocument>('spam_protection_config') };
}

// --- defaults (matches aero bot config.js) ---
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

// --- permission check ---
async function userCanManageGuild(userId: string, guildId: string): Promise<boolean> {
    try {
        const { db } = await connectToMongoDB();
        const guild = await db.collection('bot_guilds').findOne({
            guildId, ownerId: userId, botHasPermissions: true
        });
        return guild !== null;
    } catch { return false; }
}

// --- validation ---
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function validateConfig(c: any): { valid: boolean; config: AntiSpamConfig; errors: string[] } {
    const errors: string[] = [];

    // booleans
    const bools: (keyof AntiSpamConfig)[] = [
        'enabled', 'messageSpamEnabled', 'linkSpamEnabled', 'blockAllLinks',
        'imageSpamEnabled', 'webhookSpamEnabled', 'sendWarningInChannel',
        'sendWarningDM', 'notifyOwner', 'deleteSpamMessages'
    ];
    for (const k of bools) {
        if (typeof c[k] !== 'boolean') { c[k] = (defaultConfig as any)[k]; }
    }

    // numbers
    c.messageCount = clamp(Number(c.messageCount) || 3, 1, 50);
    c.messageTimeWindow = clamp(Number(c.messageTimeWindow) || 3, 1, 60);
    c.imageCount = clamp(Number(c.imageCount) || 3, 1, 50);
    c.imageTimeWindow = clamp(Number(c.imageTimeWindow) || 5, 1, 60);
    c.webhookMessageCount = clamp(Number(c.webhookMessageCount) || 3, 1, 50);
    c.webhookTimeWindow = clamp(Number(c.webhookTimeWindow) || 5, 1, 60);
    c.timeoutDuration = clamp(Number(c.timeoutDuration) || 300, 60, 2419200);
    c.maxStrikes = clamp(Number(c.maxStrikes) || 3, 1, 20);
    c.strikeExpiry = clamp(Number(c.strikeExpiry) || 10800, 60, 86400);
    c.deleteWarningAfter = clamp(Number(c.deleteWarningAfter) || 3, 1, 60);

    // enums
    if (!['warn', 'instant'].includes(c.linkAction)) c.linkAction = 'warn';
    if (!['kick', 'ban', 'timeout'].includes(c.punishmentType)) c.punishmentType = 'timeout';

    // arrays
    if (!Array.isArray(c.blockedDomains)) c.blockedDomains = defaultConfig.blockedDomains;
    if (!Array.isArray(c.trustedUsers)) c.trustedUsers = [];
    if (!Array.isArray(c.trustedRoles)) c.trustedRoles = [];
    if (!Array.isArray(c.bypassRoles)) c.bypassRoles = [];

    // optional
    if (c.logChannelId !== null && (typeof c.logChannelId !== 'string' || !/^\d{17,20}$/.test(c.logChannelId))) {
        c.logChannelId = null;
    }

    return { valid: errors.length === 0, config: c as AntiSpamConfig, errors };
}

const validateGuildId = (id: string) => /^\d{17,20}$/.test(id);

// --- GET ---
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'auth required' }, { status: 401 });

        const guildId = new URL(request.url).searchParams.get('guildId');
        if (!guildId || !validateGuildId(guildId)) return NextResponse.json({ error: 'invalid guild id' }, { status: 400 });

        if (!(await userCanManageGuild(session.user.id, guildId)))
            return NextResponse.json({ error: 'no permission' }, { status: 403 });

        const { collection } = await connectToMongoDB();
        const doc = await collection.findOne({ guildId });
        if (!doc) return NextResponse.json({ error: 'not found' }, { status: 404 });

        return NextResponse.json(doc);
    } catch (e) {
        console.error('antispam GET:', e);
        return NextResponse.json({ error: 'internal error' }, { status: 500 });
    }
}

// --- POST ---
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'auth required' }, { status: 401 });

        const { guildId, config } = await request.json();
        if (!guildId || !validateGuildId(guildId)) return NextResponse.json({ error: 'invalid guild id' }, { status: 400 });

        if (!(await userCanManageGuild(session.user.id, guildId)))
            return NextResponse.json({ error: 'no permission' }, { status: 403 });

        if (!config) return NextResponse.json({ error: 'config required' }, { status: 400 });

        const { config: validated } = validateConfig({ ...config });

        const { collection } = await connectToMongoDB();
        const now = new Date();
        const existing = await collection.findOne({ guildId });

        await collection.replaceOne(
            { guildId },
            { guildId, config: validated, lastUpdated: now, createdAt: existing?.createdAt || now },
            { upsert: true }
        );

        const updated = await collection.findOne({ guildId });
        return NextResponse.json(updated);
    } catch (e) {
        console.error('antispam POST:', e);
        return NextResponse.json({ error: 'internal error' }, { status: 500 });
    }
}

// --- PUT (reset to defaults) ---
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'auth required' }, { status: 401 });

        const guildId = new URL(request.url).searchParams.get('guildId');
        if (!guildId || !validateGuildId(guildId)) return NextResponse.json({ error: 'invalid guild id' }, { status: 400 });

        if (!(await userCanManageGuild(session.user.id, guildId)))
            return NextResponse.json({ error: 'no permission' }, { status: 403 });

        const { collection } = await connectToMongoDB();
        const now = new Date();
        const existing = await collection.findOne({ guildId });

        await collection.replaceOne(
            { guildId },
            { guildId, config: { ...defaultConfig }, lastUpdated: now, createdAt: existing?.createdAt || now },
            { upsert: true }
        );

        const updated = await collection.findOne({ guildId });
        return NextResponse.json(updated);
    } catch (e) {
        console.error('antispam PUT:', e);
        return NextResponse.json({ error: 'internal error' }, { status: 500 });
    }
}

// --- DELETE ---
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'auth required' }, { status: 401 });

        const guildId = new URL(request.url).searchParams.get('guildId');
        if (!guildId || !validateGuildId(guildId)) return NextResponse.json({ error: 'invalid guild id' }, { status: 400 });

        if (!(await userCanManageGuild(session.user.id, guildId)))
            return NextResponse.json({ error: 'no permission' }, { status: 403 });

        const { collection } = await connectToMongoDB();
        const result = await collection.deleteOne({ guildId });
        if (result.deletedCount === 0) return NextResponse.json({ error: 'not found' }, { status: 404 });

        return NextResponse.json({ message: 'deleted' });
    } catch (e) {
        console.error('antispam DELETE:', e);
        return NextResponse.json({ error: 'internal error' }, { status: 500 });
    }
}
