// src/services/BotTemplateManager.js
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const { spawn } = require('child_process');

class BotTemplateManager {
  constructor() {
    this.API_URL = process.env.BOT_API_URL || 'https://www.laxenta.tech/api/shapes';
    this.AUTH_TOKEN = process.env.BOT_API_AUTH;
    this.POLL_INTERVAL = 3000;
    this.isPolling = false;
    this.pollCount = 0;
    
    // Directory where bot files will be created
    this.botsDir = path.join(__dirname, '../../generated-bots');
    this.templatesDir = path.join(__dirname, '../templates');
    
    // Track running bot processes
    this.runningBots = new Map();
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fsSync.existsSync(this.botsDir)) {
      fsSync.mkdirSync(this.botsDir, { recursive: true });
    }
    if (!fsSync.existsSync(this.templatesDir)) {
      fsSync.mkdirSync(this.templatesDir, { recursive: true });
    }
  }

  log(type, message, data = null) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = chalk.gray('[' + timestamp + ']');
    
    const icons = {
      info: chalk.blue('ℹ'),
      success: chalk.green('✓'),
      error: chalk.red('✗'),
      pending: chalk.yellow('⏳'),
      network: chalk.magenta('🌐'),
      bot: chalk.cyan('🤖'),
      file: chalk.yellow('📄'),
      process: chalk.green('⚡')
    };
    
    console.log(prefix + ' ' + (icons[type] || '•') + ' ' + message);
    if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));
  }

  getBotTemplate() {
    // Use a regular string instead of template literal for the entire template
    return [
      "const { Client, GatewayIntentBits } = require('discord.js');",
      "const axios = require('axios');",
      "const fs = require('fs').promises;",
      "const fsSync = require('fs');",
      "const path = require('path');",
      "",
      "// Bot Configuration (auto-generated)",
      "const BOT_CONFIG = {",
      "  id: '{{BOT_ID}}',",
      "  token: '{{BOT_TOKEN}}',", 
      "  model: '{{BOT_MODEL}}',",
      "  instruction: '{{BOT_INSTRUCTION}}',",
      "  limit: {{BOT_LIMIT}},",
      "  cooldown: {{BOT_COOLDOWN}},",
      "  maxLength: {{BOT_MAX_LENGTH}},",
      "  botName: '{{BOT_NAME}}',",
      "  userId: '{{USER_ID}}'",
      "};",
      "",
      "const API_KEY = process.env.APEXIFY_API_KEY || 'eheehhehehe';",
      "",
      "class MessageProcessor {",
      "  constructor(config = {}) {",
      "    this.activeRequests = new Map();",
      "    this.typingSessions = new Map();",
      "    this.requestTimeouts = new Map();",
      "    ",
      "    this.config = {",
      "      model: config.model || 'llama-3-lumimaid-70b',",
      "      cooldown: config.cooldown || 3000,",
      "      maxLength: config.maxLength || 8000,",
      "      limit: config.limit || 10,",
      "      typingInterval: 5000,",
      "      requestTimeout: 30000,",
      "      maxRetries: 3,",
      "      instruction: config.instruction || 'You are a helpful assistant.',",
      "      botId: config.botId || 'unknown',",
      "      botName: config.botName || 'Bot'",
      "    };",
      "    ",
      "    this.historyDir = path.join(__dirname, 'AiHistory', this.config.botId);",
      "    if (!fsSync.existsSync(this.historyDir)) {",
      "      fsSync.mkdirSync(this.historyDir, { recursive: true });",
      "    }",
      "",
      "    this.memoryCache = new Map();",
      "    this.CACHE_DURATION = 1000 * 60 * 10;",
      "    ",
      "    console.log(`MessageProcessor initialized for bot ${this.config.botId} with model: ${this.config.model}`);",
      "  }",
      "",
      "  getRequestKey(channelId, userId) {",
      "    return `${channelId}-${userId}`;",
      "  }",
      "",
      "  getMemoryFilePath(userId) {",
      "    return path.join(this.historyDir, `memory_${userId}.json`);",
      "  }",
      "",
      "  async loadMemory(userId) {",
      "    if (this.memoryCache.has(userId)) {",
      "      return this.memoryCache.get(userId);",
      "    }",
      "",
      "    const filePath = this.getMemoryFilePath(userId);",
      "    try {",
      "      const data = await fs.readFile(filePath, 'utf8');",
      "      const pairs = JSON.parse(data);",
      "      const memory = pairs.flatMap(pair => [",
      "        { ",
      "          role: \"user\", ",
      "          content: pair.user.includes(\":\") ? pair.user : `unknown_user: ${pair.user}`",
      "        },",
      "        { ",
      "          role: \"assistant\", ",
      "          content: pair.system ",
      "        }",
      "      ]);",
      "      this.memoryCache.set(userId, memory);",
      "      return memory;",
      "    } catch (err) {",
      "      const empty = [];",
      "      this.memoryCache.set(userId, empty);",
      "      return empty;",
      "    }",
      "  }",
      "",
      "  async saveMemory(userId, memory) {",
      "    const formattedMemory = [];",
      "    for (let i = 0; i < memory.length; i += 2) {",
      "      if (i + 1 < memory.length) {",
      "        formattedMemory.push({",
      "          user: memory[i].content,",
      "          system: memory[i + 1].content",
      "        });",
      "      }",
      "    }",
      "    ",
      "    const filePath = this.getMemoryFilePath(userId);",
      "    await fs.writeFile(filePath, JSON.stringify(formattedMemory, null, 2), 'utf8');",
      "  }",
      "",
      "  startTyping(channel, key) {",
      "    if (this.typingSessions.has(key)) return;",
      "    const sendTyping = () => channel.sendTyping().catch(() => {});",
      "    sendTyping();",
      "    const interval = setInterval(sendTyping, this.config.typingInterval);",
      "    this.typingSessions.set(key, interval);",
      "  }",
      "",
      "  cleanupRequest(key) {",
      "    if (this.typingSessions.has(key)) {",
      "      clearInterval(this.typingSessions.get(key));",
      "      this.typingSessions.delete(key);",
      "    }",
      "    this.activeRequests.delete(key);",
      "",
      "    if (this.requestTimeouts.has(key)) {",
      "      clearTimeout(this.requestTimeouts.get(key));",
      "      this.requestTimeouts.delete(key);",
      "    }",
      "  }",
      "",
      "  async apiCallWithRetries(url, payload, axiosConfig, retries = 3) {",
      "    let attempt = 0;",
      "    while (attempt < retries) {",
      "      try {",
      "        const response = await Promise.race([",
      "          axios.post(url, payload, {",
      "            ...axiosConfig,",
      "            timeout: this.config.requestTimeout",
      "          }),",
      "          new Promise((_, reject) => ",
      "            setTimeout(() => reject(new Error('Request timeout')), this.config.requestTimeout)",
      "          )",
      "        ]);",
      "        return response;",
      "      } catch (error) {",
      "        attempt++;",
      "        console.error(`[${this.config.botId}] API call attempt ${attempt} failed:`, error.message);",
      "        if (attempt >= retries) throw error;",
      "        await new Promise(res => setTimeout(res, 1000 * attempt));",
      "      }",
      "    }",
      "  }",
      "",
      "  async processMessage(message) {",
      "    const key = this.getRequestKey(message.channel.id, message.author.id);",
      "    ",
      "    if (this.activeRequests.has(key)) {",
      "      const lastRequest = this.activeRequests.get(key);",
      "      const timeSince = Date.now() - lastRequest;",
      "      if (timeSince < this.config.cooldown) {",
      "        return;",
      "      }",
      "    }",
      "    ",
      "    this.activeRequests.set(key, Date.now());",
      "",
      "    try {",
      "      this.startTyping(message.channel, key);",
      "",
      "      let query = message.content || '';",
      "      if (message.mentions && message.client && message.client.user) {",
      "        const botMention = new RegExp(`<@!?\${message.client.user.id}>`, 'g');",
      "        query = query.replace(botMention, '').trim();",
      "      }",
      "",
      "      if (!query) return;",
      "",
      "      let memory = await this.loadMemory(message.author.id);",
      "      ",
      "      const formattedQuery = {",
      "        role: \"user\",",
      "        content: `\${message.author.username}: \${query}`",
      "      };",
      "      ",
      "      const conversation = [",
      "        {",
      "          role: \"system\",",
      "          content: this.config.instruction",
      "        },",
      "        ...memory,",
      "        formattedQuery",
      "      ];",
      "",
      "      const response = await this.apiCallWithRetries(",
      "        'https://api.electronhub.ai/v1/chat/completions',",
      "        {",
      "          model: this.config.model,",
      "          messages: conversation,",
      "          temperature: 0.9,",
      "          presence_penalty: 0.6,",
      "          frequency_penalty: 0.7,",
      "          stream: false",
      "        },",
      "        {",
      "          headers: {",
      "            'Authorization': `Bearer \${API_KEY}`,",
      "            'Content-Type': 'application/json'",
      "          }",
      "        }",
      "      );",
      "",
      "      const aiResponse = response.data.choices[0].message.content;",
      "",
      "      if (aiResponse.length > this.config.maxLength) {",
      "        const chunks = this.splitText(aiResponse, 2000);",
      "        for (const chunk of chunks) {",
      "          await message.reply({ ",
      "            content: chunk,",
      "            allowedMentions: { repliedUser: false }",
      "          });",
      "        }",
      "      } else {",
      "        await message.reply({ ",
      "          content: aiResponse,",
      "          allowedMentions: { repliedUser: false }",
      "        });",
      "      }",
      "",
      "      memory.push(formattedQuery);",
      "      memory.push({",
      "        role: \"assistant\",",
      "        content: aiResponse",
      "      });",
      "      ",
      "      if (memory.length > this.config.limit * 2) {",
      "        memory = memory.slice(-(this.config.limit * 2));",
      "      }",
      "      ",
      "      await this.saveMemory(message.author.id, memory);",
      "",
      "    } catch (error) {",
      "      console.error(`[${this.config.botId}] Error:`, error.message);",
      "      await message.reply({",
      "        content: 'Sorry, I encountered an error processing your message.',",
      "        allowedMentions: { repliedUser: false }",
      "      }).catch(() => {});",
      "    } finally {",
      "      this.cleanupRequest(key);",
      "    }",
      "  }",
      "",
      "  splitText(text, max = 2000) {",
      "    const chunks = [];",
      "    for (let i = 0; i < text.length; i += max) {",
      "      chunks.push(text.slice(i, i + max));",
      "    }",
      "    return chunks;",
      "  }",
      "}",
      "",
      "// Main Bot Logic",
      "class DiscordBot {",
      "  constructor() {",
      "    this.client = new Client({",
      "      intents: [",
      "        GatewayIntentBits.Guilds,",
      "        GatewayIntentBits.GuildMessages,",
      "        GatewayIntentBits.MessageContent,",
      "        GatewayIntentBits.DirectMessages",
      "      ]",
      "    });",
      "",
      "    this.processor = new MessageProcessor({",
      "      model: BOT_CONFIG.model,",
      "      limit: BOT_CONFIG.limit,",
      "      instruction: BOT_CONFIG.instruction,",
      "      cooldown: BOT_CONFIG.cooldown || 3000,",
      "      maxLength: BOT_CONFIG.maxLength || 8000,",
      "      botId: BOT_CONFIG.id,",
      "      botName: BOT_CONFIG.botName",
      "    });",
      "",
      "    this.setupEvents();",
      "  }",
      "",
      "  setupEvents() {",
      "    this.client.once('ready', () => {",
      "      console.log(`🤖 \${this.client.user.tag} is online!`);",
      "      console.log(`📊 Guilds: \${this.client.guilds.cache.size}`);",
      "      this.updateStatus('online');",
      "    });",
      "",
      "    this.client.on('messageCreate', async (message) => {",
      "      if (message.author.bot) return;",
      "      ",
      "      const isMentioned = message.mentions.has(this.client.user);",
      "      const isDM = message.channel.type === 1;",
      "      ",
      "      if (isMentioned || isDM) {",
      "        await this.processor.processMessage(message);",
      "      }",
      "    });",
      "",
      "    this.client.on('guildCreate', (guild) => {",
      "      console.log(`➕ Joined guild: \${guild.name}`);",
      "      this.updateStatus('online');",
      "    });",
      "",
      "    this.client.on('guildDelete', (guild) => {",
      "      console.log(`➖ Left guild: \${guild.name}`);",
      "      this.updateStatus('online');",
      "    });",
      "",
      "    this.client.on('error', (error) => {",
      "      console.error('Discord client error:', error);",
      "      this.updateStatus('error', error.message);",
      "    });",
      "  }",
      "",
      "  async updateStatus(status, error = null) {",
      "    try {",
      "      const updateData = {",
      "        botId: BOT_CONFIG.id,",
      "        status,",
      "        error,",
      "        guilds: this.client.guilds ? this.client.guilds.cache.size : 0,",
      "        hostInfo: {",
      "          hostname: require('os').hostname(),",
      "          uptime: process.uptime(),",
      "          timestamp: new Date().toISOString(),",
      "          nodeVersion: process.version,",
      "          memory: process.memoryUsage()",
      "        }",
      "      };",
      "",
      "      await axios.post('{{API_URL}}/status', updateData, {",
      "        headers: {",
      "          'Authorization': 'Bearer {{AUTH_TOKEN}}',",
      "          'Content-Type': 'application/json'",
      "        }",
      "      });",
      "    } catch (err) {",
      "      console.error('Failed to update status:', err.message);",
      "    }",
      "  }",
      "",
      "  async start() {",
      "    try {",
      "      console.log(`🚀 Starting bot \${BOT_CONFIG.botName} (\${BOT_CONFIG.id})`);",
      "      await this.client.login(BOT_CONFIG.token);",
      "    } catch (error) {",
      "      console.error('Failed to start bot:', error.message);",
      "      this.updateStatus('failed', error.message);",
      "      process.exit(1);",
      "    }",
      "  }",
      "}",
      "",
      "// Handle process termination gracefully",
      "process.on('SIGINT', () => {",
      "  console.log('\\n⏹️  Shutting down bot...');",
      "  process.exit(0);",
      "});",
      "",
      "process.on('SIGTERM', () => {",
      "  console.log('\\n⏹️  Bot terminated');",
      "  process.exit(0);",
      "});",
      "",
      "// Start the bot",
      "const bot = new DiscordBot();",
      "bot.start().catch(console.error);",
      ""
    ].join('\n');
  }

  // Create bot file from template
  async createBotFile(botConfig) {
    const botName = botConfig.discordInfo?.username || 'Unknown';
    const botFileName = 'bot_' + botConfig.id + '.js';
    const botFilePath = path.join(this.botsDir, botFileName);

    this.log('file', 'Creating bot file: ' + chalk.cyan(botFileName));
    this.log('info', '├─ ID: ' + botConfig.id);
    this.log('info', '├─ Name: ' + botName);
    this.log('info', '└─ Model: ' + (botConfig.model || 'llama-3-lumimaid-70b'));

    try {
      let template = this.getBotTemplate();
      
      // Clean and escape instruction text
      const cleanInstruction = (botConfig.instruction || 'You are a helpful assistant.')
        .replace(/'/g, "\\'")
        .replace(/\\/g, "\\\\")
        .replace(/\$/g, "\\$")
        .replace(/`/g, "'");

      // Replace template variables
      const replacements = {
        '{{BOT_ID}}': botConfig.id,
        '{{BOT_TOKEN}}': botConfig.token,
        '{{BOT_MODEL}}': botConfig.model || 'llama-3-lumimaid-70b',
        '{{BOT_INSTRUCTION}}': cleanInstruction,
        '{{BOT_LIMIT}}': botConfig.limit || 10,
        '{{BOT_COOLDOWN}}': botConfig.cooldown || 3000,
        '{{BOT_MAX_LENGTH}}': botConfig.maxLength || 8000,
        '{{BOT_NAME}}': botName,
        '{{USER_ID}}': botConfig.userId,
        '{{API_URL}}': this.API_URL,
        '{{AUTH_TOKEN}}': this.AUTH_TOKEN
      };

      // Use a more robust replacement approach
      for (const [key, value] of Object.entries(replacements)) {
        template = template.split(key).join(value);
      }

      await fs.writeFile(botFilePath, template, 'utf8');
      this.log('success', 'Bot file created: ' + botFilePath);
      
      return botFilePath;
    } catch (error) {
      this.log('error', 'Failed to create bot file: ' + error.message);
      throw error;
    }
  }

  // Start a bot process
  async startBot(botConfig) {
    const botFilePath = await this.createBotFile(botConfig);
    const botName = botConfig.discordInfo?.username || 'Unknown';
    
    this.log('process', 'Starting bot process: ' + chalk.cyan(botName));
    
    try {
      const botProcess = spawn('node', [botFilePath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd(),
        env: { ...process.env }
      });

      // Store process reference
      this.runningBots.set(botConfig.id, {
        process: botProcess,
        filePath: botFilePath,
        config: botConfig,
        startTime: Date.now()
      });

      // Handle process output
      botProcess.stdout.on('data', (data) => {
        console.log(chalk.gray('[' + botName + '] ' + data.toString().trim()));
      });

      botProcess.stderr.on('data', (data) => {
        console.error(chalk.red('[' + botName + '] ERROR: ' + data.toString().trim()));
      });

      botProcess.on('close', (code) => {
        this.log('process', 'Bot process ' + chalk.cyan(botName) + ' exited with code ' + code);
        this.runningBots.delete(botConfig.id);
      });

      botProcess.on('error', (error) => {
        this.log('error', 'Bot process ' + chalk.cyan(botName) + ' error: ' + error.message);
        this.updateBotStatus(botConfig.id, 'error', error.message);
      });

      this.log('success', 'Bot process started: ' + chalk.cyan(botName) + ' (PID: ' + botProcess.pid + ')');
      
    } catch (error) {
      this.log('error', 'Failed to start bot process: ' + error.message);
      await this.updateBotStatus(botConfig.id, 'failed', error.message);
      throw error;
    }
  }

  // Stop a bot process
  async stopBot(botId) {
    const botInfo = this.runningBots.get(botId);
    if (!botInfo) {
      this.log('info', 'Bot \${botId} not found or already stopped');
      return;
    }

    const botName = botInfo.config.discordInfo?.username || 'Unknown';
    
    this.log('process', 'Stopping bot: ' + chalk.cyan(botName));
    
    try {
      // Kill the process
      botInfo.process.kill('SIGTERM');
      
      // Wait a bit for graceful shutdown
      setTimeout(() => {
        if (!botInfo.process.killed) {
          botInfo.process.kill('SIGKILL');
        }
      }, 5000);
      
      this.runningBots.delete(botId);
      await this.updateBotStatus(botId, 'offline');
      
      this.log('success', 'Bot stopped: ' + chalk.cyan(botName));
      
    } catch (error) {
      this.log('error', 'Failed to stop bot: ' + error.message);
    }
  }

  // Delete bot file
  async deleteBot(botId) {
    await this.stopBot(botId);
    
    const botFileName = 'bot_' + botId + '.js';
    const botFilePath = path.join(this.botsDir, botFileName);
    
    try {
      if (fsSync.existsSync(botFilePath)) {
        await fs.unlink(botFilePath);
        this.log('file', 'Deleted bot file: ' + botFileName);
      }
      
      // Also clean up history directory
      const historyDir = path.join(__dirname, 'AiHistory', botId);
      if (fsSync.existsSync(historyDir)) {
        await fs.rmdir(historyDir, { recursive: true });
        this.log('file', 'Cleaned up history directory for bot \${botId}');
      }
      
    } catch (error) {
      this.log('error', 'Failed to delete bot files: ' + error.message);
    }
  }

  // Update bot (recreate with new config)
  async updateBot(botConfig) {
    const botName = botConfig.discordInfo?.username || 'Unknown';
    this.log('pending', 'Updating bot: ' + chalk.cyan(botName));
    
    await this.stopBot(botConfig.id);
    await this.startBot(botConfig);
  }

  // Fetch pending bots from API
  async fetchPendingBots() {
    this.log('network', 'Fetching pending bots from: ' + this.API_URL + '?pending=true');
    
    try {
      const response = await axios.get(`${this.API_URL}?pending=true`, {
        headers: {
          'Authorization': `Bearer ${this.AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      const bots = response.data.bots || [];
      this.log('success', `Found \${bots.length} pending bot(s)`);
      
      return bots;
    } catch (error) {
      this.log('error', 'Failed to fetch pending bots: ' + error.message);
      return [];
    }
  }

  // Update bot status via API
  async updateBotStatus(botId, status, error = null, guilds = null) {
    try {
      const updateData = {
        botId,
        status,
        error,
        guilds,
        hostInfo: {
          hostname: require('os').hostname(),
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          nodeVersion: process.version,
          memory: process.memoryUsage()
        }
      };

      await axios.post(`${this.API_URL}/status`, updateData, {
        headers: {
          'Authorization': `Bearer ${this.AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
    } catch (error) {
      this.log('error', 'Failed to update bot status: ' + error.message);
    }
  }

  // Main polling loop
  async pollAndProcess() {
    if (this.isPolling) return;
    
    this.pollCount++;
    this.log('network', `Starting poll #\${this.pollCount}`);
    this.log('info', `├─ Running bots: \${this.runningBots.size}`);
    this.log('info', `└─ Memory usage: \${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    
    this.isPolling = true;

    try {
      const pendingBots = await this.fetchPendingBots();
      
      for (const botConfig of pendingBots) {
        const botName = botConfig.discordInfo?.username || 'Unknown';
        
        switch(botConfig.action) {
          case 'create':
            this.log('pending', `Action: CREATE bot \${chalk.cyan(botName)}`);
            await this.startBot(botConfig);
            break;
            
          case 'stop':
            this.log('pending', `Action: STOP bot \${chalk.cyan(botName)}`);
            await this.stopBot(botConfig.id);
            break;
            
          case 'update':
            this.log('pending', `Action: UPDATE bot \${chalk.cyan(botName)}`);
            await this.updateBot(botConfig);
            break;
            
          case 'delete':
            this.log('pending', `Action: DELETE bot \${chalk.cyan(botName)}`);
            await this.deleteBot(botConfig.id);
            break;
        }
      }

      this.log('success', `Poll #\${this.pollCount} completed`);

    } catch (error) {
      this.log('error', 'Polling error: ' + error.message);
    } finally {
      this.isPolling = false;
      console.log(chalk.gray('─'.repeat(60)));
    }
  }

  // Start the template manager
  start() {
    console.clear();
    console.log(chalk.magenta('═══════════════════════════════════════'));
    console.log(chalk.magenta('      Bot Template Manager Started      '));
    console.log(chalk.magenta('═══════════════════════════════════════'));
    this.log('info', `API: ${this.API_URL}`);
    this.log('info', `Auth Token: \${this.AUTH_TOKEN ? \`\${this.AUTH_TOKEN.substring(0, 20)}...\` : '✗ Missing'}`);
    this.log('info', `Poll Interval: ${this.POLL_INTERVAL}ms`);
    this.log('info', `Bots Directory: ${this.botsDir}`);
    console.log(chalk.magenta('═══════════════════════════════════════\\n'));
    
    if (!this.AUTH_TOKEN) {
      this.log('error', 'BOT_API_AUTH environment variable not set!');
      process.exit(1);
    }
    
    // Initial poll
    this.pollAndProcess();
    
    // Set up polling interval
    setInterval(() => {
      this.pollAndProcess();
    }, this.POLL_INTERVAL);
  }

  // Utility methods
  getRunningBotCount() {
    return this.runningBots.size;
  }

  getRunningBots() {
    const bots = [];
    for (const [id, botInfo] of this.runningBots) {
      bots.push({
        id,
        name: botInfo.config.discordInfo?.username,
        pid: botInfo.process.pid,
        uptime: Date.now() - botInfo.startTime,
        filePath: botInfo.filePath
      });
    }
    return bots;
  }
}

module.exports = BotTemplateManager;