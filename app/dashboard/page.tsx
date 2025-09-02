'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { modules, getAllCategories } from '../components/modules';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [selectedGuild, setSelectedGuild] = useState<string>('');
  const [activeModule, setActiveModule] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = (success: boolean, text: string) => {
    setMessage({ type: success ? 'success' : 'error', text });
    setTimeout(() => setMessage(null), 5000);
  };

  const ActiveComponent = modules.find(m => m.info.id === activeModule)?.component;
  const categories = getAllCategories();
  
  const filteredModules = selectedCategory === 'all' 
    ? modules 
    : modules.filter(m => m.info.category === selectedCategory);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">Access Denied</h1>
          <p>Please log in with Discord to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bot Configuration Dashboard</h1>
          <p className="text-gray-400">Manage your bot modules and settings across all servers</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span>Total Modules: {modules.length}</span>
            <span>•</span>
            <span>Categories: {categories.length}</span>
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

        {/* Guild Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Select Server</label>
          <select
            value={selectedGuild}
            onChange={(e) => {
              setSelectedGuild(e.target.value);
              setActiveModule(''); // Reset active module when changing guilds
            }}
            className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a server...</option>
            {session?.user?.guilds?.map((guild: Guild) => (
              <option key={guild.id} value={guild.id}>
                {guild.name}
              </option>
            ))}
          </select>
        </div>

        {selectedGuild && (
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
        )}

        {/* Quick Stats */}
        {!selectedGuild && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">{modules.length}</div>
              <div className="text-gray-400">Available Modules</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {session?.user?.guilds?.length || 0}
              </div>
              <div className="text-gray-400">Servers Available</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">{categories.length}</div>
              <div className="text-gray-400">Module Categories</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}