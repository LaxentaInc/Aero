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
  const [activeTab, setActiveTab] = useState<'servers' | 'modules'>('servers');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSave = (success: boolean, text: string) => {
    setMessage({ type: success ? 'success' : 'error', text });
    setTimeout(() => setMessage(null), 5000);
  };

  useEffect(() => {
    async function fetchValidGuilds() {
      if (!session?.user?.id) return;
      
      try {
        setGuildLoading(true);
        const response = await fetch(`/api/guilds?userId=${session.user.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data: ApiResponse = await response.json();
        
        if (data.success && data.guilds) {
          setValidGuilds(data.guilds);
        } else {
          setValidGuilds([]);
        }
      } catch (error) {
        console.error('Failed to fetch guilds:', error);
        setValidGuilds([]);
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

  const refreshGuilds = async () => {
    if (!session?.user?.id) return;
    
    setGuildLoading(true);
    
    try {
      const response = await fetch(`/api/guilds?userId=${session.user.id}`);
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setValidGuilds(data.guilds);
        handleSave(true, `Found ${data.count} servers`);
      }
    } catch (error) {
      handleSave(false, 'Failed to refresh servers');
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
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-[#5865F2] opacity-20 rounded-full mx-auto"></div>
          </div>
          <p className="text-gray-400 mt-4 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center bg-[#1a1f2a] p-12 rounded-2xl shadow-2xl border border-[#2a3441] backdrop-blur-xl">
          <div className="w-20 h-20 bg-gradient-to-br from-[#5865F2] to-[#7289DA] rounded-full mx-auto mb-6 animate-pulse shadow-lg shadow-[#5865F2]/20"></div>
          <h1 className="text-3xl font-bold text-white mb-4">Access Required</h1>
          <p className="text-gray-400 mb-8">Please log in with Discord to continue</p>
          <button className="px-8 py-3 bg-gradient-to-r from-[#5865F2] to-[#7289DA] text-white rounded-lg hover:shadow-lg hover:shadow-[#5865F2]/30 transition-all duration-300 hover:scale-105">
            Login with Discord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#5865F2] rounded-full opacity-5 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[#7289DA] rounded-full opacity-5 blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-[#111822] border-r border-[#2a3441] transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-20' : 'w-0'
      } overflow-hidden`}>
        <div className="flex flex-col items-center py-6 space-y-4">
          {/* Home Button */}
          <button className="group relative">
            <div className="w-12 h-12 bg-gradient-to-br from-[#5865F2] to-[#7289DA] rounded-2xl flex items-center justify-center hover:rounded-xl transition-all duration-300">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1a1f2a] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap">
              <span className="text-sm text-white">Home</span>
            </div>
          </button>

          <div className="w-12 h-px bg-[#2a3441]"></div>

          {/* Server Icons */}
          {validGuilds.slice(0, 5).map((guild) => (
            <button
              key={guild.guildId}
              onClick={() => {
                setSelectedGuild(guild.guildId);
                setActiveTab('modules');
              }}
              className="group relative"
            >
              <div className={`w-12 h-12 rounded-2xl overflow-hidden hover:rounded-xl transition-all duration-300 ${
                selectedGuild === guild.guildId ? 'ring-2 ring-[#5865F2]' : ''
              }`}>
                {guild.icon ? (
                  <img src={guild.icon.replace(/size=\d+/, 'size=256')} alt={guild.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#2a3441] flex items-center justify-center text-gray-400 font-bold">
                    {guild.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1a1f2a] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap">
                <span className="text-sm text-white">{guild.name}</span>
              </div>
              {selectedGuild === guild.guildId && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
              )}
            </button>
          ))}

          {/* Add Server Button */}
          <button className="group relative">
            <div className="w-12 h-12 bg-[#1a1f2a] border-2 border-dashed border-[#3a4451] rounded-2xl flex items-center justify-center hover:border-[#5865F2] hover:bg-[#1f2631] transition-all duration-300">
              <svg className="w-6 h-6 text-[#5865F2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-20">
        {/* Header */}
        <div className="bg-[#111822]/80 backdrop-blur-xl border-b border-[#2a3441] px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-2 animate-fade-in">Welcome Back,</p>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {session?.user?.name || 'User'}
              </h1>
              <p className="text-gray-500 mt-1">Where would you like to start?</p>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-[#5865F2] to-[#7289DA] rounded-full overflow-hidden border-2 border-green-500">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-8 mt-8">
            <button
              onClick={() => setActiveTab('servers')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'servers'
                  ? 'bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/30'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1f2a]'
              }`}
            >
              SERVERS
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'modules'
                  ? 'bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/30'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1f2a]'
              }`}
            >
              MODULES
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mx-8 mt-6 p-4 rounded-xl backdrop-blur-xl border animate-slide-down ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Content Area */}
        <div className="p-8">
          {activeTab === 'servers' ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">YOUR SERVERS</h2>
                  <p className="text-gray-400">Manage your Discord servers and bot configurations</p>
                </div>
                <button
                  onClick={refreshGuilds}
                  disabled={guildLoading}
                  className="px-6 py-3 bg-gradient-to-r from-[#5865F2] to-[#7289DA] text-white rounded-lg hover:shadow-lg hover:shadow-[#5865F2]/30 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                >
                  {guildLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {/* Server Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {validGuilds.map((guild, index) => (
                  <div
                    key={guild.guildId}
                    className="group relative bg-[#1a1f2a] rounded-xl overflow-hidden border border-[#2a3441] hover:border-[#5865F2] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#5865F2]/20 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-[#5865F2]/20 to-[#7289DA]/20">
                      {guild.icon ? (
                        <img src={guild.icon.replace(/size=\d+/, 'size=256')} alt={guild.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl font-bold text-[#5865F2]/30">
                            {guild.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2a] via-transparent to-transparent"></div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-base font-bold text-white mb-2 truncate">{guild.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {guild.memberCount}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedGuild(guild.guildId);
                          setActiveTab('modules');
                        }}
                        className="w-full py-2 text-sm bg-gradient-to-r from-[#5865F2] to-[#7289DA] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#5865F2]/30 transition-all duration-300"
                      >
                        Manage
                      </button>
                    </div>

                    {selectedGuild === guild.guildId && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                ))}

                {/* Add New Server Card */}
                <div className="group relative bg-[#1a1f2a] rounded-xl overflow-hidden border-2 border-dashed border-[#2a3441] hover:border-[#5865F2] transition-all duration-300 hover:scale-105">
                  <div className="aspect-square flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-[#2a3441] rounded-full flex items-center justify-center group-hover:bg-[#5865F2]/20 transition-colors duration-300">
                        <svg className="w-8 h-8 text-[#5865F2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-400 font-medium">Add Bot to Server</p>
                    </div>
                  </div>
                </div>
              </div>

              {validGuilds.length === 0 && !guildLoading && (
                <div className="text-center py-12 bg-[#1a1f2a] rounded-2xl border border-[#2a3441]">
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#2a3441] rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Servers Found</h3>
                  <p className="text-gray-400 mb-6">Add the bot to your Discord server to get started</p>
                  <button className="px-6 py-2.5 bg-gradient-to-r from-[#5865F2] to-[#7289DA] text-white rounded-lg hover:shadow-lg hover:shadow-[#5865F2]/30 transition-all duration-300">
                    Invite Bot
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Modules Tab */}
              {selectedGuild ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Module Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="bg-[#1a1f2a] rounded-2xl border border-[#2a3441] overflow-hidden">
                      <div className="p-6 bg-gradient-to-br from-[#5865F2]/10 to-[#7289DA]/10 border-b border-[#2a3441]">
                        <h3 className="text-lg font-bold text-white mb-2">Modules</h3>
                        <p className="text-sm text-gray-400">{filteredModules.length} available</p>
                      </div>

                      {/* Category Filter */}
                      <div className="p-4 border-b border-[#2a3441]">
                        <select
                          value={selectedCategory}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setActiveModule('');
                          }}
                          className="w-full bg-[#111822] border border-[#2a3441] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#5865F2] transition-colors"
                        >
                          <option value="all">All Categories</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Module List */}
                      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {filteredModules.map((module) => (
                          <button
                            key={module.info.id}
                            onClick={() => setActiveModule(module.info.id)}
                            className={`w-full p-4 rounded-xl transition-all duration-300 ${
                              activeModule === module.info.id
                                ? 'bg-gradient-to-r from-[#5865F2] to-[#7289DA] text-white shadow-lg shadow-[#5865F2]/30 scale-105'
                                : 'bg-[#111822] hover:bg-[#1f2631] text-gray-300 hover:scale-102'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {module.info.icon && (
                                <span className="text-2xl">{module.info.icon}</span>
                              )}
                              <div className="text-left">
                                <div className="font-semibold">{module.info.name}</div>
                                <div className="text-xs opacity-70 line-clamp-1">
                                  {module.info.description}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Module Configuration */}
                  <div className="lg:col-span-3">
                    {ActiveComponent ? (
                      <div className="bg-[#1a1f2a] rounded-2xl border border-[#2a3441] overflow-hidden animate-fade-in">
                        <div className="bg-gradient-to-r from-[#5865F2] to-[#7289DA] p-8">
                          <div className="flex items-center gap-4">
                            {modules.find(m => m.info.id === activeModule)?.info.icon && (
                              <span className="text-4xl">
                                {modules.find(m => m.info.id === activeModule)?.info.icon}
                              </span>
                            )}
                            <div>
                              <h2 className="text-2xl font-bold text-white">
                                {modules.find(m => m.info.id === activeModule)?.info.name}
                              </h2>
                              <p className="text-white/80 mt-1">
                                {modules.find(m => m.info.id === activeModule)?.info.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-8">
                          <ActiveComponent selectedGuild={selectedGuild} onSave={handleSave} />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#1a1f2a] rounded-2xl border border-[#2a3441] p-12 text-center">
                        <div className="w-24 h-24 mx-auto mb-6 bg-[#2a3441] rounded-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Select a Module</h3>
                        <p className="text-gray-400">Choose a module from the sidebar to configure its settings</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-[#2a3441] rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">No Server Selected</h3>
                  <p className="text-gray-400 mb-8">Select a server from the sidebar or go to the servers tab</p>
                  <button
                    onClick={() => setActiveTab('servers')}
                    className="px-8 py-3 bg-gradient-to-r from-[#5865F2] to-[#7289DA] text-white rounded-lg hover:shadow-lg hover:shadow-[#5865F2]/30 transition-all duration-300 hover:scale-105"
                  >
                    View Servers
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1f2a;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #5865F2;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #7289DA;
        }

        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  );
}