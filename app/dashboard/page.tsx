'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { modules, getAllCategories } from '../components/modules';

interface Guild {
  guildId: string;
  name: string;
  icon: string | null;
  memberCount: number;
  botJoinedAt: string;
  lastUpdated: string;
  features: string[];
}

interface ApiResponse {
  success: boolean;
  guilds: Guild[];
  count: number;
  error?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [selectedGuild, setSelectedGuild] = useState<string>('');
  const [activeModule, setActiveModule] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validGuilds, setValidGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [guildLoading, setGuildLoading] = useState(false);

  const handleSave = (success: boolean, text: string) => {
    setMessage({ type: success ? 'success' : 'error', text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Fetch valid guilds from MongoDB (via our new API)
  useEffect(() => {
    async function fetchValidGuilds() {
      if (!session?.user?.id) return;
      
      try {
        setGuildLoading(true);
        
        // Use the new /api/guilds endpoint
        const response = await fetch(`/api/guilds?userId=${session.user.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data: ApiResponse = await response.json();
        
        if (data.success && data.guilds) {
          setValidGuilds(data.guilds);
          setMessage({ 
            type: 'success', 
            text: `Found ${data.count} servers where you're the owner and bot has permissions` 
          });
        } else {
          setValidGuilds([]);
          setMessage({ 
            type: 'error', 
            text: data.error || 'Failed to load servers from database' 
          });
        }
      } catch (error) {
        console.error('Failed to fetch guilds:', error);
        setValidGuilds([]);
        setMessage({ 
          type: 'error', 
          text: `Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}. Check if MongoDB is accessible.` 
        });
      } finally {
        setGuildLoading(false);
        setLoading(false);
      }
    }

    if (session && status === 'authenticated') {
      fetchValidGuilds();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

  // Manual refresh function
  const refreshGuilds = async () => {
    if (!session?.user?.id) return;
    
    setGuildLoading(true);
    setMessage({ type: 'success', text: 'Refreshing server list...' });
    
    try {
      const response = await fetch(`/api/guilds?userId=${session.user.id}`);
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setValidGuilds(data.guilds);
        setMessage({ 
          type: 'success', 
          text: `Refreshed! Found ${data.count} servers` 
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to refresh' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setGuildLoading(false);
    }
  };

  const ActiveComponent = modules.find(m => m.info.id === activeModule)?.component;
  const categories = getAllCategories();
  
  const filteredModules = selectedCategory === 'all' 
    ? modules 
    : modules.filter(m => m.info.category === selectedCategory);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] mt-16 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-4rem)] mt-16 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">Access Denied</h1>
          <p>Please log in with Discord to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] mt-16 bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bot Configuration Dashboard</h1>
          <p className="text-gray-400">Manage your bot modules and settings across servers you own</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span>Total Modules: {modules.length}</span>
            <span>•</span>
            <span>Categories: {categories.length}</span>
            <span>•</span>
            <span>Your Servers: {validGuilds.length}</span>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'
          }`}>
            <p className={message.type === 'success' ? 'text-green-200' : 'text-red-200'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Connection Status & Refresh */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${
              validGuilds.length > 0 ? 'bg-green-500' : guildLoading ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-400">
              {guildLoading ? 'Loading from database...' : 
               validGuilds.length > 0 ? 'Database connected' : 'No servers found'}
            </span>
          </div>
          
          <button
            onClick={refreshGuilds}
            disabled={guildLoading}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm transition-colors"
          >
            {guildLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Guild Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Select Your Server</label>
          <select
            value={selectedGuild}
            onChange={(e) => {
              setSelectedGuild(e.target.value);
              setActiveModule(''); // Reset active module when changing guilds
            }}
            disabled={guildLoading || validGuilds.length === 0}
            className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {guildLoading ? 'Loading your servers...' : 
               validGuilds.length === 0 ? 'No servers found' : 'Choose a server...'}
            </option>
            {validGuilds.map((guild: Guild) => (
              <option key={guild.guildId} value={guild.guildId}>
                {guild.name} ({guild.memberCount} members)
              </option>
            ))}
          </select>
          
          {validGuilds.length === 0 && !guildLoading && (
            <div className="mt-2 p-3 bg-yellow-900 border border-yellow-700 rounded text-yellow-200 text-sm">
              <p className="font-semibold mb-1">No owned servers found</p>
              <p>This shows only servers where:</p>
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>You are the server owner</li>
                <li>The bot is present in the server</li>
                <li>The bot has proper permissions</li>
                <li>The bot has synced the server data to database</li>
              </ul>
              <button 
                onClick={refreshGuilds}
                className="mt-2 px-2 py-1 bg-yellow-700 hover:bg-yellow-600 rounded text-xs"
              >
                Check Again
              </button>
            </div>
          )}

          {/* Show some server info when selected */}
          {selectedGuild && validGuilds.length > 0 && (
            <div className="mt-2 text-xs text-gray-400">
              {(() => {
                const guild = validGuilds.find(g => g.guildId === selectedGuild);
                return guild ? (
                  <div className="flex items-center gap-4">
                    <span>Members: {guild.memberCount}</span>
                    <span>Bot joined: {new Date(guild.botJoinedAt).toLocaleDateString()}</span>
                    <span>Last updated: {new Date(guild.lastUpdated).toLocaleString()}</span>
                    {guild.features.length > 0 && (
                      <span>Features: {guild.features.slice(0, 3).join(', ')}{guild.features.length > 3 ? '...' : ''}</span>
                    )}
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>

        {/* Selected Guild Summary */}
        {selectedGuild && validGuilds.length > 0 && (
          <div className="mb-6">
            {(() => {
              const guild = validGuilds.find(g => g.guildId === selectedGuild);
              return guild ? (
                <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-center gap-3">
                    {guild.icon ? (
                      <img
                        src={guild.icon}
                        alt={`${guild.name} icon`}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold">
                        {guild.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-white">Managing: {guild.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <span>{guild.memberCount.toLocaleString()} members</span>
                        <span>Bot joined: {new Date(guild.botJoinedAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(guild.lastUpdated).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Module Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Modules</h3>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                    {filteredModules.length}
                  </span>
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div className="mb-4">
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setActiveModule(''); // Reset active module when changing category
                      }}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Module List */}
                <div className="space-y-2">
                  {filteredModules.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center py-4">
                      No modules in this category
                    </div>
                  ) : (
                    filteredModules.map((module) => (
                      <button
                        key={module.info.id}
                        onClick={() => setActiveModule(module.info.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          activeModule === module.info.id
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:scale-102'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {module.info.icon && (
                            <span className="text-lg">{module.info.icon}</span>
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-sm">{module.info.name}</div>
                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {module.info.description}
                            </div>
                          </div>
                        </div>
                        {module.info.category && (
                          <div className="mt-2">
                            <span className="text-xs bg-gray-600 px-2 py-1 rounded capitalize">
                              {module.info.category}
                            </span>
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Module Configuration */}
            <div className="lg:col-span-3">
              {ActiveComponent ? (
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  {/* Module Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                    <div className="flex items-center gap-3">
                      {modules.find(m => m.info.id === activeModule)?.info.icon && (
                        <span className="text-2xl">
                          {modules.find(m => m.info.id === activeModule)?.info.icon}
                        </span>
                      )}
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {modules.find(m => m.info.id === activeModule)?.info.name}
                        </h2>
                        <p className="text-blue-100 mt-1">
                          {modules.find(m => m.info.id === activeModule)?.info.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Module Content */}
                  <div className="p-6">
                    <ActiveComponent selectedGuild={selectedGuild} onSave={handleSave} />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Select a Module</h3>
                  <p className="text-gray-500">
                    Choose a module from the sidebar to configure its settings for this server.
                  </p>
                  {filteredModules.length === 0 && selectedCategory !== 'all' && (
                    <p className="text-yellow-400 mt-4 text-sm">
                      No modules found in the "{selectedCategory}" category. Try selecting "All Categories".
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

        {/* Quick Stats */}
        {!selectedGuild && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">{modules.length}</div>
              <div className="text-gray-400">Available Modules</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {validGuilds.length}
              </div>
              <div className="text-gray-400">Your Servers</div>
              <div className="text-xs text-gray-500 mt-1">
                (Owned + Bot Present)
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">{categories.length}</div>
              <div className="text-gray-400">Module Categories</div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-bold text-gray-300 mb-2">Debug Info</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Session Status: {status}</p>
              <p>User ID: {session?.user?.id || 'None'}</p>
              <p>Owned Guilds: {validGuilds.length}</p>
              <p>Selected Guild: {selectedGuild || 'None'}</p>
              <p>Active Module: {activeModule || 'None'}</p>
              <p>API Endpoint: /api/guilds</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}