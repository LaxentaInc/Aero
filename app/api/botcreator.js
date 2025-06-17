const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const { createTemplateData } = require('./templateRouter');

const API_KEY = process.env.APEXIFY_API_KEY || 'ek-3gmOPmvuljmrl4NQrohpnp1ryNXQG5bNn08zNuzhX6bcxBrndR';
const PERMANENT_INSTRUCTION = "Keep everything in SAME PEHRAGRAPH ( NO LINE BREAKS )- and try to keep responses pretty short like under 5 lines (Around 50-60 words), not long or over descriptive";

const AVAILABLE_MODELS = {
    'anubis-pro-105b-v1': 'Anubis Pro 105B',
    'llama-3.1-8b-lexi-uncensored-v2': 'Llama 3.1 Lexi 8B',
    'fallen-llama-3.3-r1-70b-v1': 'Fallen Llama 3.3 70B',
    'l3.3-ms-nevoria-70b': 'Nevoria 70B',
    'hamanasu-qwq-v2-rp': 'Hamanasu RP',
    'eurydice-24b-v2': 'Eurydice 24B'
};

class BotManager {
    constructor() {
        this.botsDir = path.join(__dirname, 'bots');
        this.memoryDir = path.join(this.botsDir, 'memory');
        this.runningBots = new Map();
        this.botTemplate = this.createBotTemplate();
        
        // Update polling properties
        this.pollingInterval = null;
        this.apiEndpoint = 'http://localhost:3000/api/ai'; // Update to match your NextJS API endpoint
        this.apiToken = 'laxenta-2w1oo0=12192eb1-2f3d-4c5a-6b7c-8d9e0f1g2h3i';
        
        this.init();
    }

    async init() {
        try {
            await fs.mkdir(this.botsDir, { recursive: true });
            await fs.mkdir(this.memoryDir, { recursive: true });
            await this.autoStartAllBots();
        } catch (err) {
            console.error('Init error:', err);
        }
    }

    async autoStartAllBots() {
        try {
            const files = await fs.readdir(this.botsDir);
            const botFiles = files.filter(file => file.endsWith('.js'));
            
            console.log(`Found ${botFiles.length} bot files. Starting all bots...`);
            
            for (const fileName of botFiles) {
                try {
                    const config = await this.getBotConfigFromFile(path.join(this.botsDir, fileName));
                    if (config && config.token) {
                        await this.startBotProcess(config.id, path.join(this.botsDir, fileName));
                        console.log(`✅ Started bot: ${config.name} (${config.id})`);
                    }
                } catch (err) {
                    console.error(`❌ Failed to start bot ${fileName}:`, err.message);
                }
            }
        } catch (err) {
            console.error('Auto-start error:', err);
        }
    }

    createBotTemplate() {
        return (config) => `/*
BOT_CONFIG:
${JSON.stringify(config, null, 2)}
*/

const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const API_KEY = '${API_KEY}';

class DiscordBot {
    constructor() {
        this.config = ${JSON.stringify(config, null, 2)};
        this.client = new Client({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, 
                     GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages]
        });
        
        this.activeRequests = new Map();
        this.typingSessions = new Map();
        this.memoryCache = new Map();
        this.memoryDir = path.join(__dirname, 'memory');
        
        this.setupHandlers();
        this.start();
    }

    setupHandlers() {
        this.client.on('ready', () => {
            console.log(\`✅ \${this.client.user.tag} ready!\`);
            this.client.user.setPresence({
                status: '${config.presence.status}',
                activities: [{ name: '${config.presence.activity}', type: '${config.presence.activityType}' }]
            });
        });

        this.client.on('messageCreate', async (msg) => {
            if (msg.author.bot || (!msg.mentions.has(this.client.user) && msg.channel.type !== 1)) return;
            
            const key = \`\${msg.channel.id}-\${msg.author.id}\`;
            if (this.activeRequests.has(key)) {
                console.log(\`[BLOCKED] Duplicate request from \${msg.author.username} in channel \${msg.channel.id}\`);
                return msg.reply("Still processing your last message!").catch(() => {});
            }
            
            console.log(\`[MESSAGE] \${msg.author.username}: \${msg.content.slice(0, 100)}\${msg.content.length > 100 ? '...' : ''}\`);
            
            try {
                await this.processMessage(msg);
            } catch (err) {
                console.error('[ERROR] Message processing failed:', err);
                msg.reply('Something went wrong. Please try again.').catch(() => {});
            }
        });

        this.client.on('error', err => console.error('[CLIENT ERROR]:', err));
        process.on('unhandledRejection', err => console.error('[UNHANDLED REJECTION]:', err));
    }

    async processMessage(msg) {
        const key = \`\${msg.channel.id}-\${msg.author.id}\`;
        this.activeRequests.set(key, true);
        
        try {
            this.startTyping(msg.channel, key);
            
            const memory = await this.loadMemory(msg.author.id);
            // Modified to simplify user messages and remove username prefixes
            const userMsg = { 
                role: "user", 
                content: msg.content.replace('<@' + this.client.user.id + '>', '').trim()
            };
            
            const conversation = [
                { role: "system", content: this.config.instruction },
                ...memory.slice(-this.config.settings.limit * 2),
                userMsg
            ];

            console.log(\`[API CALL] Sending request to \${this.config.model} with \${conversation.length} messages\`);
            
            const botResponse = await this.getResponse(conversation);
            
            if (botResponse && botResponse.trim()) {
                console.log(\`[RESPONSE] Generated \${botResponse.length} characters\`);
                
                await msg.reply({ 
                    content: botResponse, 
                    allowedMentions: { repliedUser: false } 
                });
                
                const newMemory = [...memory, userMsg, { role: "assistant", content: botResponse }];
                await this.saveMemory(msg.author.id, newMemory.slice(-this.config.settings.limit * 2));
            } else {
                console.log('[WARNING] Empty response generated');
                await msg.reply("I'm having trouble generating a response right now. Please try again.");
            }
            
        } finally {
            this.cleanupRequest(key);
        }
    }

    async getResponse(messages, retries = 3) {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                console.log(\`[API] Attempt \${attempt + 1}/\${retries}\`);
                
                const response = await axios.post('https://api.electronhub.top/v1/chat/completions', {
                    model: this.config.model,
                    messages,
                    temperature: this.config.settings.temperature,
                    presence_penalty: this.config.settings.presence_penalty,
                    frequency_penalty: this.config.settings.frequency_penalty,
                    max_tokens: this.config.settings.maxLength,
                    stream: false
                }, {
                    headers: {
                        'Authorization': \`Bearer \${API_KEY}\`,
                        'Content-Type': 'application/json'
                    },
                    timeout: this.config.settings.requestTimeout
                });

                console.log(\`[API SUCCESS] Status: \${response.status}, Model: \${response.data.model || 'unknown'}\`);
                
                const content = response.data.choices?.[0]?.message?.content;
                if (!content) {
                    throw new Error('No content in API response');
                }
                
                return content.trim();
                
            } catch (err) {
                console.error(\`[API ERROR] Attempt \${attempt + 1} failed:\`, {
                    message: err.message,
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data
                });
                
                if (attempt === retries - 1) {
                    throw new Error(\`API failed after \${retries} attempts: \${err.message}\`);
                }
                
                const delay = 1000 * Math.pow(2, attempt);
                console.log(\`[RETRY] Waiting \${delay}ms before retry...\`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    startTyping(channel, key) {
        if (this.typingSessions.has(key)) return;
        const typing = () => channel.sendTyping().catch(() => {});
        typing();
        this.typingSessions.set(key, setInterval(typing, this.config.settings.typingInterval));
    }

    cleanupRequest(key) {
        if (this.typingSessions.has(key)) {
            clearInterval(this.typingSessions.get(key));
            this.typingSessions.delete(key);
        }
        this.activeRequests.delete(key);
    }

    async loadMemory(userId) {
        if (this.memoryCache.has(userId)) return this.memoryCache.get(userId);
        
        try {
            const data = await fs.readFile(path.join(this.memoryDir, \`\${this.config.id}_\${userId}.json\`), 'utf8');
            const pairs = JSON.parse(data);
            const memory = pairs.flatMap(p => [
                { role: "user", content: p.user.includes(":") ? p.user : \`unknown_user: \${p.user}\` },
                { role: "assistant", content: p.assistant }
            ]);
            this.memoryCache.set(userId, memory);
            console.log(\`[MEMORY] Loaded \${memory.length} messages for user \${userId}\`);
            return memory;
        } catch {
            const empty = [];
            this.memoryCache.set(userId, empty);
            console.log(\`[MEMORY] No existing memory for user \${userId}\`);
            return empty;
        }
    }

    async saveMemory(userId, memory) {
        const pairs = [];
        for (let i = 0; i < memory.length; i += 2) {
            if (i + 1 < memory.length) {
                pairs.push({ 
                    user: memory[i].content,
                    // Clean up assistant response by removing any prefixes like "cute girl:"
                    assistant: memory[i + 1].content.replace(/^([^:]+:)+\s*/g, '')
                });
            }
        }
        
        await fs.writeFile(
            path.join(this.memoryDir, \`\${this.config.id}_\${userId}.json\`),
            JSON.stringify(pairs, null, 2)
        );
        this.memoryCache.set(userId, memory);
    }

    async start() {
        try {
            console.log(\`[LOGIN] Attempting to login bot: \${this.config.name}\`);
            await this.client.login('${config.token}');
        } catch (err) {
            console.error('[LOGIN ERROR]:', err.message);
            process.exit(1);
        }
    }
}

new DiscordBot();

process.on('SIGINT', () => {
    console.log('[SHUTDOWN] Gracefully shutting down...');
    process.exit(0);
});`;
    }

    async createBot(config, userId) {
        if (!config.name || !config.token) {
            throw new Error('Bot name and token are required');
        }

        const botId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const fileName = `${config.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${botId}.js`;
        const filePath = path.join(this.botsDir, fileName);

        // Combine user instruction with permanent instruction
        const finalInstruction = `${config.instruction || 'Define Personality, Looks, whatever you want here :3'}\n\n${PERMANENT_INSTRUCTION}`;

        const botConfig = {
            id: botId,
            fileName,
            name: config.name,
            token: config.token,
            model: config.model || 'anubis-pro-105b-v1',
            instruction: finalInstruction,
            userId,
            settings: this.parseSettings(config.settings),
            presence: this.parsePresence(config.presence),
            createdAt: new Date().toISOString(),
            isRunning: false
        };

        await fs.writeFile(filePath, this.botTemplate(botConfig));
        await this.updateIndex(botConfig);

        try {
            await this.startBotProcess(botId, filePath);
            botConfig.isRunning = true;
        } catch (err) {
            console.error(`Failed to start bot ${botConfig.name}:`, err.message);
        }

        return botConfig;
    }

    parseSettings(settings = {}) {
        return {
            temperature: Math.max(0, Math.min(2, parseFloat(settings.temperature || 0.9))),
            presence_penalty: Math.max(0, Math.min(2, parseFloat(settings.presence_penalty || 0.6))),
            frequency_penalty: Math.max(0, Math.min(2, parseFloat(settings.frequency_penalty || 0.7))),
            limit: Math.max(1, Math.min(50, parseInt(settings.limit || 10))),
            maxLength: Math.max(100, Math.min(8000, parseInt(settings.maxLength || 4000))),
            typingInterval: Math.max(1000, Math.min(30000, parseInt(settings.typingInterval || 5000))),
            requestTimeout: Math.max(5000, Math.min(120000, parseInt(settings.requestTimeout || 30000))),
            maxRetries: Math.max(1, Math.min(10, parseInt(settings.maxRetries || 3))),
            cooldown: Math.max(0, Math.min(60000, parseInt(settings.cooldown || 3000)))
        };
    }

    parsePresence(presence = {}) {
        const validStatuses = ['online', 'idle', 'dnd', 'invisible'];
        const validActivities = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'COMPETING'];
        
        return {
            status: validStatuses.includes(presence.status) ? presence.status : 'online',
            activity: presence.activity || 'with humans',
            activityType: validActivities.includes(presence.activityType) ? presence.activityType : 'PLAYING'
        };
    }

    async startBotProcess(botId, filePath) {
        if (this.runningBots.has(botId)) {
            throw new Error('Bot is already running');
        }

        const process = spawn('node', [filePath], { 
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: false
        });

        process.stdout.on('data', (data) => {
            console.log(`[${botId}] ${data.toString().trim()}`);
        });

        process.stderr.on('data', (data) => {
            console.error(`[${botId} ERROR] ${data.toString().trim()}`);
        });

        process.on('exit', (code, signal) => {
            console.log(`[${botId}] Exited with code ${code}, signal ${signal}`);
            this.runningBots.delete(botId);
        });

        process.on('error', (err) => {
            console.error(`[${botId}] Process error:`, err);
            this.runningBots.delete(botId);
        });

        this.runningBots.set(botId, process);
        return true;
    }

    async getBotConfigFromFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const match = content.match(/\/\*\s*BOT_CONFIG:\s*([\s\S]*?)\s*\*\//);
            return match ? JSON.parse(match[1]) : null;
        } catch (err) {
            console.error('error reading config:', err);
            return null;
        }
    }

    async updateIndex(botConfig) {
        const indexPath = path.join(this.botsDir, 'bots-index.json');
        
        let index = {};
        try {
            const data = await fs.readFile(indexPath, 'utf8');
            index = JSON.parse(data);
        } catch (err) {
            // Index doesn't exist, start fresh
        }
        
        index[botConfig.id] = {
            id: botConfig.id,
            fileName: botConfig.fileName,
            name: botConfig.name,
            userId: botConfig.userId,
            createdAt: botConfig.createdAt,
            updatedAt: botConfig.updatedAt || botConfig.createdAt
        };
        
        await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
    }

    async getUserBots(userId) {
        try {
            const files = await fs.readdir(this.botsDir);
            const botFiles = files.filter(file => file.endsWith('.js'));
            const userBots = [];

            for (const fileName of botFiles) {
                const config = await this.getBotConfigFromFile(path.join(this.botsDir, fileName));
                if (config?.userId === userId) {
                    config.isRunning = this.runningBots.has(config.id);
                    config.fileName = fileName;
                    userBots.push(config);
                }
            }

            return userBots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (err) {
            console.error('Error getting user bots:', err);
            return [];
        }
    }

    async updateBot(botId, newConfig, userId) {
        const bot = await this.getBotById(botId);
        if (!bot || bot.userId !== userId) {
            throw new Error('Bot not found or access denied');
        }

        const filePath = path.join(this.botsDir, bot.fileName);
        
        // Combine user instruction with permanent instruction when updating
        const finalInstruction = newConfig.instruction ? 
            `${newConfig.instruction}\n\n${PERMANENT_INSTRUCTION}` : 
            bot.instruction;

        const updatedConfig = {
            ...bot,
            name: newConfig.botName || bot.name,
            model: newConfig.model || bot.model,
            instruction: finalInstruction,
            settings: this.parseSettings(newConfig),
            presence: this.parsePresence(newConfig),
            updatedAt: new Date().toISOString()
        };

        await this.stopBot(botId, userId).catch(() => {});
        await fs.writeFile(filePath, this.botTemplate(updatedConfig));
        await this.updateIndex(updatedConfig);
        
        try {
            await this.startBotProcess(botId, filePath);
            updatedConfig.isRunning = true;
        } catch (err) {
            console.error(`Failed to restart bot after update:`, err.message);
            updatedConfig.isRunning = false;
        }

        return updatedConfig;
    }

    async startBot(botId, userId) {
        const bot = await this.getBotById(botId);
        if (!bot || bot.userId !== userId) {
            throw new Error('Bot not found or access denied');
        }
        
        return await this.startBotProcess(botId, path.join(this.botsDir, bot.fileName));
    }

    async stopBot(botId, userId) {
        const bot = await this.getBotById(botId);
        if (!bot || bot.userId !== userId) {
            throw new Error('Bot not found or access denied');
        }

        const process = this.runningBots.get(botId);
        if (process) {
            process.kill('SIGTERM');
            this.runningBots.delete(botId);
            return true;
        }
        return false;
    }

    async deleteBot(botId, userId) {
        const bot = await this.getBotById(botId);
        if (!bot || bot.userId !== userId) {
            throw new Error('Bot not found or access denied');
        }

        await this.stopBot(botId, userId).catch(() => {});
        await fs.unlink(path.join(this.botsDir, bot.fileName));

        try {
            const memoryFiles = await fs.readdir(this.memoryDir);
            const botMemoryFiles = memoryFiles.filter(file => file.startsWith(`${botId}_`));
            await Promise.all(botMemoryFiles.map(file => 
                fs.unlink(path.join(this.memoryDir, file))
            ));
        } catch (err) {
            console.error('Memory cleanup error:', err);
        }

        try {
            const indexPath = path.join(this.botsDir, 'bots-index.json');
            const data = await fs.readFile(indexPath, 'utf8');
            const index = JSON.parse(data);
            delete index[botId];
            await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
        } catch (err) {
            console.error('Index update error:', err);
        }

        return true;
    }

    async getBotById(botId) {
        try {
            const files = await fs.readdir(this.botsDir);
            for (const fileName of files.filter(f => f.endsWith('.js'))) {
                const config = await this.getBotConfigFromFile(path.join(this.botsDir, fileName));
                if (config?.id === botId) {
                    return {
                        ...config,
                        isRunning: this.runningBots.has(botId),
                        fileName
                    };
                }
            }
        } catch (err) {
            console.error('Error getting bot by ID:', err);
        }
        return null;
    }

    getRouter(isAuthenticated) {
        const router = express.Router();
        
        const handleError = (res, error, status = 500) => {
            console.error('Route error:', error);
            if (res.headersSent) return;
            
            const message = error.message || 'Internal server error';
            res.status(status).json({ 
                error: message,
                success: false,
                timestamp: new Date().toISOString()
            });
        };

        router.get('/bots', isAuthenticated, async (req, res) => {
            try {
                const templateData = await createTemplateData(req, req.app.locals.client, this);
                res.render('dashboard', templateData);
            } catch (error) {
                handleError(res, error);
            }
        });

        router.get('/api/bots', isAuthenticated, async (req, res) => {
            try {
                const bots = await this.getUserBots(req.user.discordId);
                res.json({ success: true, bots });
            } catch (error) {
                handleError(res, error);
            }
        });

        router.post('/api/bots', isAuthenticated, async (req, res) => {
            try {
                const bot = await this.createBot(req.body, req.user.discordId);
                res.status(201).json({ success: true, bot });
            } catch (error) {
                handleError(res, error, 400);
            }
        });

        router.post('/api/bots/:id/:action', isAuthenticated, async (req, res) => {
            try {
                const { id, action } = req.params;
                const userId = req.user.discordId;
                
                let result;
                switch (action) {
                    case 'start':
                        result = await this.startBot(id, userId);
                        break;
                    case 'stop':
                        result = await this.stopBot(id, userId);
                        break;
                    case 'update':
                        result = await this.updateBot(id, req.body, userId);
                        break;
                    case 'delete':
                        result = await this.deleteBot(id, userId);
                        break;
                    default:
                        throw new Error('Invalid action');
                }
                
                res.json({ success: true, result });
            } catch (error) {
                handleError(res, error, error.message.includes('not found') ? 404 : 400);
            }
        });

        router.get('/api/bots/:id', isAuthenticated, async (req, res) => {
            try {
                const bot = await this.getBotById(req.params.id);
                if (!bot) {
                    return handleError(res, new Error('Bot not found'), 404);
                }
                
                if (bot.userId !== req.user.discordId) {
                    return res.json({
                        success: true,
                        bot: {
                            id: bot.id,
                            name: bot.name,
                            isPublic: bot.isPublic || false,
                            createdAt: bot.createdAt
                        }
                    });
                }
                
                res.json({ success: true, bot });
            } catch (error) {
                handleError(res, error);
            }
        });

        router.get('/bots/edit/:id', isAuthenticated, async (req, res) => {
            try {
                const bot = await this.getBotById(req.params.id);
                if (!bot || bot.userId !== req.user.discordId) {
                    return res.status(404).render('error', {
                        error: 'Bot not found or access denied',
                        ...await createTemplateData(req, req.app.locals.client, this)
                    });
                }
                
                res.render('edit-bot', {
                    bot,
                    models: AVAILABLE_MODELS,
                    settings: {
                        temperature: {min: 0, max: 2, default: 0.9},
                        presence_penalty: {min: 0, max: 2, default: 0.6},
                        frequency_penalty: {min: 0, max: 2, default: 0.7},
                        limit: {min: 1, max: 50, default: 10},
                        maxLength: {min: 100, max: 8000, default: 4000},
                        typingInterval: {min: 1000, max: 30000, default: 5000},
                        requestTimeout: {min: 5000, max: 120000, default: 30000},
                        maxRetries: {min: 1, max: 10, default: 3},
                        cooldown: {min: 0, max: 60000, default: 3000}
                    },
                    presence: {
                        statuses: ['online', 'idle', 'dnd', 'invisible'],
                        activities: ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'COMPETING']
                    },
                    ...await createTemplateData(req, req.app.locals.client, this)
                });
            } catch (error) {
                handleError(res, error);
            }
        });

        return router;
    }

    async getBotTemplateData(userId) {
        const userBots = await this.getUserBots(userId);
        return {
            userBots,
            runningCount: userBots.filter(bot => bot.isRunning).length,
            totalCount: userBots.length
        };
    }

    // Add these new methods after the existing methods
    startPolling() {
        console.log('[POLLING] Starting to poll for new bots...');
        
        this.pollForNewBots();
        
        this.pollingInterval = setInterval(() => {
            this.pollForNewBots();
        }, 10000);
    }

    async pollForNewBots() {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': this.apiToken,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.error(`[POLLING] API responded with ${response.status}`);
                return;
            }
            
            const data = await response.json();
            
            if (data.bots && data.bots.length > 0) {
                console.log(`[POLLING] Received ${data.bots.length} new bot(s)`);
                
                for (const botConfig of data.bots) {
                    try {
                        await this.createBotFromConfig(botConfig);
                        await this.confirmBotCreation(botConfig.id, 'created');
                    } catch (error) {
                        console.error(`[POLLING] Failed to create bot ${botConfig.name}:`, error);
                        await this.confirmBotCreation(botConfig.id, 'failed');
                    }
                }
            }
        } catch (error) {
            console.error('[POLLING] Error polling API:', error);
        }
    }

    async createBotFromConfig(config) {
        console.log(`[BOT CREATE] Creating bot: ${config.name}`);
        
        const fileName = config.fileName || `${config.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${config.id}.js`;
        const filePath = path.join(this.botsDir, fileName);
        
        await fs.writeFile(filePath, this.botTemplate(config));
        await this.updateIndex(config);
        
        try {
            await this.startBotProcess(config.id, filePath);
            console.log(`✅ Bot ${config.name} started successfully`);
        } catch (err) {
            console.error(`❌ Failed to start bot ${config.name}:`, err.message);
            throw err;
        }
    }

    async confirmBotCreation(botId, status) {
        try {
            await fetch(this.apiEndpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': this.apiToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    botId,
                    status
                })
            });
        } catch (error) {
            console.error('[POLLING] Failed to confirm bot creation:', error);
        }
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            console.log('[POLLING] Stopped polling');
        }
    }
}

module.exports = BotManager;