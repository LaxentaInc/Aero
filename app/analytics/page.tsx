'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Activity, Shield, Users, AlertTriangle, TrendingUp, Clock, Database, Zap } from 'lucide-react';

// Type definitions
interface AnalyticsEvent {
  eventType: string;
  data: {
    guildId?: string;
    triggerType?: string;
    joinCount?: number;
    timestamp?: number;
    [key: string]: any;
  };
  timestamp: number;
  id: string;
  guildId: string | null;
  source: string;
  version: string;
}

interface AnalyticsData {
  events: AnalyticsEvent[];
  summary: {
    totalEvents: number;
    dateRange: {
      start: number;
      end: number;
    };
    eventTypes: Record<string, number>;
    guilds: Record<string, number>;
    topGuilds: Array<{ guildId: string; count: number }>;
    recentActivity: Array<{
      hour: string;
      count: number;
    }>;
    raidStats: {
      totalRaids: number;
      avgJoinRate: number;
      topTriggerTypes: Record<string, number>;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

type TimeFilter = '1h' | '24h' | '7d' | '30d';

const Dashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24h');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Colors for dark theme
  const colors = {
    primary: '#00d4ff',
    secondary: '#7c3aed',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    accent: '#ec4899'
  };

  const pieColors = ['#00d4ff', '#7c3aed', '#10b981', '#ef4444', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  // Fetch data from API
  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      const timeRanges: Record<TimeFilter, number> = {
        '1h': Date.now() - (60 * 60 * 1000),
        '24h': Date.now() - (24 * 60 * 60 * 1000),
        '7d': Date.now() - (7 * 24 * 60 * 60 * 1000),
        '30d': Date.now() - (30 * 24 * 60 * 60 * 1000)
      };

      const startTime = timeRanges[timeFilter];
      const url = `/api/analytics?limit=1000&startTime=${startTime}&summary=true`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeFilter]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, timeFilter]);

  // Prepare chart data
  const getEventTypeChartData = (): Array<{name: string; value: number; color: string}> => {
    if (!data?.summary?.eventTypes) return [];
    return Object.entries(data.summary.eventTypes).map(([name, value]) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value: value,
      color: pieColors[Object.keys(data.summary.eventTypes).indexOf(name) % pieColors.length]
    }));
  };

  const getActivityChartData = (): Array<{time: string; events: number}> => {
    if (!data?.summary?.recentActivity) return [];
    return data.summary.recentActivity.map((item: {hour: string; count: number}) => ({
      time: new Date(item.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      events: item.count
    }));
  };

  const getTopGuildsData = (): Array<{guild: string; events: number}> => {
    if (!data?.summary?.topGuilds) return [];
    return data.summary.topGuilds.slice(0, 8).map((guild: {guildId: string; count: number}) => ({
      guild: `Guild ${guild.guildId.slice(-6)}`,
      events: guild.count
    }));
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-gray-800 p-8 rounded-lg border border-red-500/20">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Anti-Raid Analytics
              </h1>
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Filter */}
              <select 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              
              {/* Auto Refresh Toggle */}
              <label className="flex items-center space-x-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={autoRefresh} 
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-blue-400 focus:ring-blue-400"
                />
                <span>Auto-refresh</span>
              </label>
              
              <button 
                onClick={fetchData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="mt-4">
            <div className="flex space-x-1">
              {['overview', 'events', 'guilds'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Events</p>
                    <p className="text-3xl font-bold text-white">{data?.summary?.totalEvents?.toLocaleString() || '0'}</p>
                  </div>
                  <Database className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Raids Detected</p>
                    <p className="text-3xl font-bold text-red-400">{data?.summary?.raidStats?.totalRaids || '0'}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Guilds</p>
                    <p className="text-3xl font-bold text-green-400">{data?.summary?.topGuilds?.length || '0'}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Join Rate</p>
                    <p className="text-3xl font-bold text-yellow-400">{data?.summary?.raidStats?.avgJoinRate || '0'}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Timeline */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold">Activity Timeline</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getActivityChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" tick={{fontSize: 12}} />
                    <YAxis stroke="#9ca3af" tick={{fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="events" 
                      stroke={colors.primary} 
                      strokeWidth={3}
                      dot={{ r: 4, fill: colors.primary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Event Types */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold">Event Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getEventTypeChartData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="value"
                      label={({name, percent}: {name: string; percent?: number}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                      fontSize={11}
                    >
                      {getEventTypeChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Guilds Chart */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-semibold">Most Active Guilds</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getTopGuildsData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="guild" stroke="#9ca3af" tick={{fontSize: 12}} />
                  <YAxis stroke="#9ca3af" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }} 
                  />
                  <Bar dataKey="events" fill={colors.success} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span>Recent Events</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 text-gray-400">Time</th>
                    <th className="text-left py-3 text-gray-400">Event</th>
                    <th className="text-left py-3 text-gray-400">Guild</th>
                    <th className="text-left py-3 text-gray-400">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.events?.slice(0, 20).map((event: AnalyticsEvent, index: number) => (
                    <tr key={event.id || index} className="border-b border-gray-800 hover:bg-gray-700/50">
                      <td className="py-3 text-gray-300">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          event.eventType.includes('raid') ? 'bg-red-900/50 text-red-300' :
                          event.eventType.includes('ban') ? 'bg-yellow-900/50 text-yellow-300' :
                          'bg-blue-900/50 text-blue-300'
                        }`}>
                          {event.eventType.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">
                        {event.guildId ? `...${event.guildId.slice(-6)}` : 'N/A'}
                      </td>
                      <td className="py-3 text-gray-400 text-xs">
                        {event.data?.triggerType && (
                          <span className="mr-2">Trigger: {event.data.triggerType}</span>
                        )}
                        {event.data?.joinCount && (
                          <span>Joins: {event.data.joinCount}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Guilds Tab */}
        {activeTab === 'guilds' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-400" />
              <span>Guild Statistics</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.summary?.topGuilds?.map((guild: {guildId: string; count: number}, index: number) => (
                <div key={guild.guildId} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Guild {guild.guildId.slice(-8)}</h4>
                    <span className="text-xs bg-blue-600 px-2 py-1 rounded">#{index + 1}</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{guild.count}</p>
                  <p className="text-sm text-gray-400">total events</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <p>Anti-Raid Analytics Dashboard</p>
            <p>Last updated: {data ? new Date(data.summary?.dateRange?.end).toLocaleString() : 'Never'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;