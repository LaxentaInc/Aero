"use client";

import { useState, useEffect } from "react";

// Types
interface SpamProtectionConfig {
  enabled: boolean;
  logChannelId: string | null;
  keywords: string[];
  regexPatterns: string[];
  allowList: string[];
  mentionLimit: number;
  blockProfanity: boolean;
  blockSexualContent: boolean;
  blockSlurs: boolean;
  blockMessage: boolean;
  timeoutDuration: number;
  sendAlert: boolean;
  lastUpdated: Date | null;
}

interface ModuleConfigProps {
  selectedGuild: string;
  onSave?: (success: boolean, message: string) => void;
}

// Export module info for auto-loader
export const moduleInfo = {
  id: "spam-protection",
  name: "Spam Protection",
  description: "Advanced spam and content filtering system",
  category: "moderation",
};

const createDefaultConfig = (): SpamProtectionConfig => ({
  enabled: false,
  logChannelId: null,
  keywords: [],
  regexPatterns: [],
  allowList: [],
  mentionLimit: 5,
  blockProfanity: false,
  blockSexualContent: false,
  blockSlurs: true,
  blockMessage: true,
  timeoutDuration: 300,
  sendAlert: true,
  lastUpdated: null,
});

const presetFilters = [
  {
    key: "blockProfanity",
    label: "Block Profanity",
    description: "Filter common profanity and inappropriate language",
    severity: "medium",
  },
  {
    key: "blockSexualContent",
    label: "Block Sexual Content",
    description: "Filter sexually explicit content and references",
    severity: "high",
  },
  {
    key: "blockSlurs",
    label: "Block Slurs",
    description: "Filter offensive slurs and hate speech",
    severity: "critical",
  },
];

export default function SpamProtection({
  selectedGuild,
  onSave,
}: ModuleConfigProps) {
  const [config, setConfig] = useState<SpamProtectionConfig>(createDefaultConfig());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [newKeyword, setNewKeyword] = useState("");
  const [newPattern, setNewPattern] = useState("");
  const [newAllowItem, setNewAllowItem] = useState("");
  const [activeTab, setActiveTab] = useState<
    "basic" | "filters" | "keywords" | "advanced"
  >("basic");

  // Save cooldown logic
  const canSave = !lastSaved || Date.now() - lastSaved.getTime() >= 15000;
  const cooldownRemaining = lastSaved
    ? Math.max(0, 15000 - (Date.now() - lastSaved.getTime()))
    : 0;

  useEffect(() => {
    if (selectedGuild) {
      loadConfig();
    }
  }, [selectedGuild]);

  useEffect(() => {
    if (!canSave) {
      const timer = setInterval(() => {
        const remaining = lastSaved
          ? Math.max(0, 15000 - (Date.now() - lastSaved.getTime()))
          : 0;
        if (remaining === 0) {
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [lastSaved, canSave]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/spam-protection?guildId=${selectedGuild}`,
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const loadedConfig = {
            ...createDefaultConfig(),
            ...data.data,
          };
          setConfig(loadedConfig);
        } else {
          throw new Error(data.error || "Failed to load configuration");
        }
      } else {
        throw new Error("Failed to load configuration");
      }
    } catch (error) {
      console.error("Failed to load config:", error);
      setSaveMessage({ type: "error", text: "Failed to load configuration" });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!selectedGuild || !canSave) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/spam-protection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guildId: selectedGuild,
          config: config,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLastSaved(new Date());
        setSaveMessage({
          type: "success",
          text: data.message || "Configuration saved successfully!",
        });
        onSave?.(true, data.message || "Configuration saved successfully!");
      } else {
        throw new Error(data.error || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Failed to save config:", error);
      setSaveMessage({ type: "error", text: "Failed to save configuration" });
      onSave?.(false, "Failed to save configuration");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const updateConfig = (key: keyof SpamProtectionConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !config.keywords.includes(newKeyword.trim())) {
      updateConfig("keywords", [...config.keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    updateConfig(
      "keywords",
      config.keywords.filter((k) => k !== keyword),
    );
  };

  const addPattern = () => {
    if (newPattern.trim() && !config.regexPatterns.includes(newPattern.trim())) {
      updateConfig("regexPatterns", [...config.regexPatterns, newPattern.trim()]);
      setNewPattern("");
    }
  };

  const removePattern = (pattern: string) => {
    updateConfig(
      "regexPatterns",
      config.regexPatterns.filter((p) => p !== pattern),
    );
  };

  const addAllowItem = () => {
    if (newAllowItem.trim() && !config.allowList.includes(newAllowItem.trim())) {
      updateConfig("allowList", [...config.allowList, newAllowItem.trim()]);
      setNewAllowItem("");
    }
  };

  const removeAllowItem = (item: string) => {
    updateConfig(
      "allowList",
      config.allowList.filter((i) => i !== item),
    );
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-400 bg-red-900/20";
      case "high": return "text-orange-400 bg-orange-900/20";
      case "medium": return "text-yellow-400 bg-yellow-900/20";
      default: return "text-gray-400 bg-gray-900/20";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <div className="text-gray-400">Loading spam protection configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Spam Protection</h2>
            <p className="text-gray-400">Advanced content filtering and spam detection</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${config.enabled ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className={`font-medium ${config.enabled ? "text-green-400" : "text-red-400"}`}>
                {config.enabled ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded p-3">
            <div className="text-gray-400 text-sm">Keywords</div>
            <div className="text-xl font-bold text-blue-400">{config.keywords.length}</div>
          </div>
          <div className="bg-gray-900 rounded p-3">
            <div className="text-gray-400 text-sm">Patterns</div>
            <div className="text-xl font-bold text-purple-400">{config.regexPatterns.length}</div>
          </div>
          <div className="bg-gray-900 rounded p-3">
            <div className="text-gray-400 text-sm">Allow List</div>
            <div className="text-xl font-bold text-green-400">{config.allowList.length}</div>
          </div>
          <div className="bg-gray-900 rounded p-3">
            <div className="text-gray-400 text-sm">Mention Limit</div>
            <div className="text-xl font-bold text-yellow-400">{config.mentionLimit}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { id: "basic", label: "Basic Settings" },
          { id: "filters", label: "Content Filters" },
          { id: "keywords", label: "Keywords & Patterns" },
          { id: "advanced", label: "Advanced" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === "basic" && (
          <div className="space-y-6">
            {/* Module Toggle */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Enable Spam Protection</h3>
                  <p className="text-gray-400 text-sm">Activate the spam protection system</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => updateConfig("enabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Actions and Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Action Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Block Message</label>
                    <input
                      type="checkbox"
                      checked={config.blockMessage}
                      onChange={(e) => updateConfig("blockMessage", e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Send Alert</label>
                    <input
                      type="checkbox"
                      checked={config.sendAlert}
                      onChange={(e) => updateConfig("sendAlert", e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Timeout Duration: {formatDuration(config.timeoutDuration)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2419200"
                      step="60"
                      value={config.timeoutDuration}
                      onChange={(e) => updateConfig("timeoutDuration", parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Mention Settings</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maximum Mentions: {config.mentionLimit}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={config.mentionLimit}
                    onChange={(e) => updateConfig("mentionLimit", parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Log Channel */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Log Channel</h3>
              <input
                type="text"
                placeholder="Enter Discord Channel ID for logging (optional)"
                value={config.logChannelId || ""}
                onChange={(e) => updateConfig("logChannelId", e.target.value || null)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {activeTab === "filters" && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Content Filters</h3>
            <div className="space-y-4">
              {presetFilters.map((filter) => (
                <div key={filter.key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-white">{filter.label}</h4>
                      <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(filter.severity)}`}>
                        {filter.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{filter.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={config[filter.key as keyof SpamProtectionConfig] as boolean}
                      onChange={(e) => updateConfig(filter.key as keyof SpamProtectionConfig, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "keywords" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Blocked Keywords */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-400">Blocked Keywords</h3>
                <span className="bg-red-900/20 text-red-400 px-2 py-1 rounded text-sm">
                  {config.keywords.length}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <input
                  type="text"
                  placeholder="Add keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={addKeyword}
                  disabled={!newKeyword.trim()}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm font-medium"
                >
                  Add Keyword
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {config.keywords.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No keywords configured</p>
                ) : (
                  config.keywords.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                      <span className="text-sm font-mono text-red-300">{keyword}</span>
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="text-red-400 hover:text-red-300 text-xs p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Regex Patterns */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-400">Regex Patterns</h3>
                <span className="bg-purple-900/20 text-purple-400 px-2 py-1 rounded text-sm">
                  {config.regexPatterns.length}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <input
                  type="text"
                  placeholder="Add regex pattern..."
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addPattern()}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={addPattern}
                  disabled={!newPattern.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm font-medium"
                >
                  Add Pattern
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {config.regexPatterns.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No patterns configured</p>
                ) : (
                  config.regexPatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                      <span className="text-sm font-mono text-purple-300 truncate">{pattern}</span>
                      <button
                        onClick={() => removePattern(pattern)}
                        className="text-red-400 hover:text-red-300 text-xs p-1 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Allow List */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-400">Allow List</h3>
                <span className="bg-green-900/20 text-green-400 px-2 py-1 rounded text-sm">
                  {config.allowList.length}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <input
                  type="text"
                  placeholder="Add allowed phrase..."
                  value={newAllowItem}
                  onChange={(e) => setNewAllowItem(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addAllowItem()}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={addAllowItem}
                  disabled={!newAllowItem.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm font-medium"
                >
                  Add to Allow List
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {config.allowList.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No allow list items</p>
                ) : (
                  config.allowList.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                      <span className="text-sm font-mono text-green-300">{item}</span>
                      <button
                        onClick={() => removeAllowItem(item)}
                        className="text-red-400 hover:text-red-300 text-xs p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Configuration Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400">Status</div>
                  <div className={`text-lg font-semibold ${config.enabled ? "text-green-400" : "text-red-400"}`}>
                    {config.enabled ? "Active" : "Inactive"}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400">Total Rules</div>
                  <div className="text-lg font-semibold text-blue-400">
                    {config.keywords.length + config.regexPatterns.length + 
                     (config.blockProfanity ? 1 : 0) + (config.blockSexualContent ? 1 : 0) + (config.blockSlurs ? 1 : 0)}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400">Timeout</div>
                  <div className="text-lg font-semibold text-orange-400">
                    {config.timeoutDuration > 0 ? formatDuration(config.timeoutDuration) : "Disabled"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Configuration Export</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const configBlob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(configBlob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `spam-protection-config-${selectedGuild}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
                >
                  Export Config
                </button>
                <button
                  onClick={() => {
                    if (confirm("Reset configuration to defaults? This cannot be undone.")) {
                      setConfig(createDefaultConfig());
                    }
                  }}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm font-medium"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="border-t border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-400">
            {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
          </div>
          {!canSave && (
            <div className="text-sm text-orange-400">
              Save available in {Math.ceil(cooldownRemaining / 1000)}s
            </div>
          )}
        </div>

        <button
          onClick={saveConfig}
          disabled={saving || !selectedGuild || !canSave}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
            canSave && !saving
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-600 cursor-not-allowed text-gray-300"
          }`}
        >
          {saving ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving Configuration...</span>
            </div>
          ) : !canSave ? (
            `Save Cooldown (${Math.ceil(cooldownRemaining / 1000)}s)`
          ) : (
            "Save Configuration"
          )}
        </button>

        {saveMessage && (
          <div
            className={`mt-3 p-3 rounded-lg text-sm ${
              saveMessage.type === "success"
                ? "bg-green-900/20 border border-green-500/20 text-green-400"
                : "bg-red-900/20 border border-red-500/20 text-red-400"
            }`}
          >
            {saveMessage.text}
          </div>
        )}
      </div>
    </div>
  );
}