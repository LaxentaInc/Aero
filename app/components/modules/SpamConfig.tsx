'use client';

import { useState, useEffect } from 'react';

// Types
interface SpamProtectionConfig {
  enabled: boolean;
  logChannelId: string | null;
  timeoutDuration: number;
  customMessage: string;
  keywordList: string[];
  trustedUsers: string[];
  trustedRoles: string[];
  mentionLimit: number;
  enableSpamProtection: boolean;
  enableMentionSpam: boolean;
  enableKeywordFilter: boolean;
  enableDuplicateText: boolean;
  logActions: boolean;
  debug: boolean;
}

interface SpamProtectionDocument {
  guildId: string;
  config: SpamProtectionConfig;
  autoModRuleIds: string[];
  lastUpdated: string;
  createdAt: string;
}

interface ModuleConfigProps {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}

// Export module info for auto-loader (index.ts file)
export const moduleInfo = {
  id: 'spam-protection',
  name: 'Spam Protection',
  description: 'Advanced spam detection and filtering with AutoMod integration',
  category: 'moderation',
  icon: '🚫'
};

const defaultConfig: SpamProtectionConfig = {
  enabled: true,
  logChannelId: null,
  timeoutDuration: 600,
  customMessage: 'Your message was flagged by spam protection.',
  keywordList: [],
  trustedUsers: [],
  trustedRoles: [],
  mentionLimit: 5,
  enableSpamProtection: true,
  enableMentionSpam: true,
  enableKeywordFilter: false,
  enableDuplicateText: true,
  logActions: true,
  debug: false
};

const protectionFeatures = [
  { key: 'enableSpamProtection', label: 'General Spam Detection', description: 'Detects rapid message sending and spam patterns' },
  { key: 'enableMentionSpam', label: 'Mention Spam Protection', description: 'Blocks messages with excessive mentions' },
  { key: 'enableKeywordFilter', label: 'Keyword Filtering', description: 'Filters messages containing blacklisted words' },
  { key: 'enableDuplicateText', label: 'Duplicate Text Detection', description: 'Prevents spam through repeated messages' }
];

export default function SpamProtectionConfig({ selectedGuild, onSave }: ModuleConfigProps) {
  const [config, setConfig] = useState<SpamProtectionConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  // Load config when guild is selected
  useEffect(() => {
    if (selectedGuild) {
      loadConfig();
    }
  }, [selectedGuild]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/spam-protection?guildId=${selectedGuild}`);
      
      if (response.ok) {
        const data: SpamProtectionDocument = await response.json();
        setConfig(data.config);
      } else if (response.status === 404) {
        // No config exists, use defaults
        setConfig(defaultConfig);
      } else {
        throw new Error('Failed to load configuration');
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      onSave?.(false, 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!selectedGuild) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/spam-protection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guildId: selectedGuild,
          config: config,
        }),
      });

      if (response.ok) {
        onSave?.(true, 'Spam protection configuration saved successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      onSave?.(false, error instanceof Error ? error.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof SpamProtectionConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const addTrustedUser = () => {
    const userId = prompt('Enter Discord User ID:');
    if (userId && /^\d+$/.test(userId) && !config.trustedUsers.includes(userId)) {
      updateConfig('trustedUsers', [...config.trustedUsers, userId]);
    }
  };

  const removeTrustedUser = (userId: string) => {
    updateConfig('trustedUsers', config.trustedUsers.filter(id => id !== userId));
  };

  const addTrustedRole = () => {
    const roleId = prompt('Enter Discord Role ID:');
    if (roleId && /^\d+$/.test(roleId) && !config.trustedRoles.includes(roleId)) {
      updateConfig('trustedRoles', [...config.trustedRoles, roleId]);
    }
  };

  const removeTrustedRole = (roleId: string) => {
    updateConfig('trustedRoles', config.trustedRoles.filter(id => id !== roleId));
  };

  const addKeyword = () => {
    const keyword = newKeyword.trim().toLowerCase();
    if (keyword && !config.keywordList.includes(keyword)) {
      updateConfig('keywordList', [...config.keywordList, keyword]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    updateConfig('keywordList', config.keywordList.filter(k => k !== keyword));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-400">Loading spam protection configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Status Card */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Spam Protection System</h2>
            <p className="text-gray-300">Advanced spam detection with Discord AutoMod integration</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              config.enabled 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {config.enabled ? '🟢 ACTIVE' : '🔴 DISABLED'}
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => updateConfig('enabled', e.target.checked)}
                className="sr-only"
              />
              <div className={`relative w-14 h-8 rounded-full transition-colors ${
                config.enabled ? 'bg-green-500' : 'bg-gray-600'
              }`}>
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}></div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Protection Features */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <span className="text-2xl mr-3">🛡️</span>
          Protection Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {protectionFeatures.map((feature) => (
            <div key={feature.key} className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{feature.label}</h4>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
                <label className="flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={config[feature.key as keyof SpamProtectionConfig] as boolean}
                    onChange={(e) => updateConfig(feature.key as keyof SpamProtectionConfig, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative w-12 h-6 rounded-full transition-colors ${
                    config[feature.key as keyof SpamProtectionConfig] ? 'bg-blue-500' : 'bg-gray-600'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      config[feature.key as keyof SpamProtectionConfig] ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Settings */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Detection Settings */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <span className="text-2xl mr-3">⚙️</span>
            Detection Settings
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mention Limit per Message
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={config.mentionLimit}
                onChange={(e) => updateConfig('mentionLimit', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1</span>
                <span className="text-blue-400 font-medium">{config.mentionLimit}</span>
                <span>50</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Timeout Duration
              </label>
              <select
                value={config.timeoutDuration}
                onChange={(e) => updateConfig('timeoutDuration', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
                <option value={600}>10 minutes</option>
                <option value={1800}>30 minutes</option>
                <option value={3600}>1 hour</option>
                <option value={86400}>24 hours</option>
                <option value={604800}>7 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Log Channel ID
              </label>
              <input
                type="text"
                placeholder="Enter Discord Channel ID (optional)"
                value={config.logChannelId || ''}
                onChange={(e) => updateConfig('logChannelId', e.target.value || null)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Response Settings */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <span className="text-2xl mr-3">💬</span>
            Response Settings
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom AutoMod Message
              </label>
              <textarea
                value={config.customMessage}
                onChange={(e) => updateConfig('customMessage', e.target.value)}
                placeholder="Message shown when content is flagged..."
                maxLength={2000}
                className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="text-xs text-gray-400 mt-1">
                {config.customMessage.length}/2000 characters
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                <div>
                  <div className="font-medium text-white text-sm">Log Actions</div>
                  <div className="text-xs text-gray-400">Enable detailed logging</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.logActions}
                  onChange={(e) => updateConfig('logActions', e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                <div>
                  <div className="font-medium text-white text-sm">Debug Mode</div>
                  <div className="text-xs text-gray-400">Enhanced diagnostics</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.debug}
                  onChange={(e) => updateConfig('debug', e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyword Filter */}
      {config.enableKeywordFilter && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <span className="text-2xl mr-3">📝</span>
            Keyword Filter
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Add keyword to filter..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addKeyword}
                disabled={!newKeyword.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {config.keywordList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No keywords configured</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {config.keywordList.map((keyword, index) => (
                    <div key={index} className="flex items-center bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1">
                      <span className="text-red-300 text-sm mr-2">{keyword}</span>
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="text-red-400 hover:text-red-300 text-sm w-4 h-4 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trusted Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trusted Users */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <span className="text-2xl mr-3">👥</span>
              Trusted Users
            </h3>
            <button
              onClick={addTrustedUser}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add User
            </button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {config.trustedUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">👤</div>
                <p>No trusted users configured</p>
              </div>
            ) : (
              config.trustedUsers.map((userId) => (
                <div key={userId} className="flex items-center justify-between bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3">
                  <span className="text-sm font-mono text-gray-300">{userId}</span>
                  <button
                    onClick={() => removeTrustedUser(userId)}
                    className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trusted Roles */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <span className="text-2xl mr-3">🎭</span>
              Trusted Roles
            </h3>
            <button
              onClick={addTrustedRole}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add Role
            </button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {config.trustedRoles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎭</div>
                <p>No trusted roles configured</p>
              </div>
            ) : (
              config.trustedRoles.map((roleId) => (
                <div key={roleId} className="flex items-center justify-between bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3">
                  <span className="text-sm font-mono text-gray-300">{roleId}</span>
                  <button
                    onClick={() => removeTrustedRole(roleId)}
                    className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <button
          onClick={saveConfig}
          disabled={saving || !selectedGuild}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
        >
          {saving ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              Saving Configuration...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">💾</span>
              Save Spam Protection Settings
            </div>
          )}
        </button>
      </div>

      {/* Configuration Summary */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Configuration Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl mb-2">{config.enabled ? '✅' : '❌'}</div>
            <div className="text-sm text-gray-400">Protection Status</div>
            <div className="text-lg font-medium text-white">{config.enabled ? 'Active' : 'Disabled'}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm text-gray-400">Active Features</div>
            <div className="text-lg font-medium text-blue-400">
              {protectionFeatures.filter(f => config[f.key as keyof SpamProtectionConfig]).length}/4
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm text-gray-400">Mention Limit</div>
            <div className="text-lg font-medium text-yellow-400">{config.mentionLimit}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">⏱️</div>
            <div className="text-sm text-gray-400">Timeout Duration</div>
            <div className="text-lg font-medium text-orange-400">
              {config.timeoutDuration >= 3600 
                ? `${Math.floor(config.timeoutDuration / 3600)}h` 
                : `${Math.floor(config.timeoutDuration / 60)}m`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}