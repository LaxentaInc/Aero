'use client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieLabelRenderProps } from 'recharts';
import { Shield, AlertTriangle, Activity, Server, Clock, Users, TrendingUp, Eye } from 'lucide-react';

interface AnalyticsEvent {
  eventType: string;
  data: any;
  timestamp: number;
  id: string;
}

interface GuildStats {
  guildId: string;
  total: number;
  raids: number;
  lastActivity: number;
}

interface AnalyticsStats {
  totalEvents: number;
  recentEvents: number;
  weeklyEvents: number;
  eventTypes: Record<string, number>;
  guildStats: Record<string, { total: number; raids: number; lastActivity: number }>;
  hourlyActivity: Array<{ hour: string; count: number }>;
  topGuilds: GuildStats[];
}

interface TimeSeriesData {
  timestamp: number;
  date: string;
  count: number;
  label: string;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [recentEvents, setRecentEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');

  // Fetch analytics data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch('/api/raidAnalytics?action=stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch time series
      const interval = timeRange === '24h' ? 'hour' : 'day';
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      const timeSeriesRes = await fetch(`/api/raidAnalytics?action=timeseries&interval=${interval}&days=${days}`);
      const timeSeriesData = await timeSeriesRes.json();
      setTimeSeries(timeSeriesData.timeSeries);

      // Fetch recent events
      const eventsRes = await fetch('/api/raidAnalytics?action=events&limit=50');
      const eventsData = await eventsRes.json();
      setRecentEvents(eventsData.events);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatEventType = (eventType: string) => {
    return eventType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'raid_detected': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'user_join': return <Users className="h-4 w-4 text-green-500" />;
      case 'suspicious_activity': return <Eye className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const pieChartData = stats ? Object.entries(stats.eventTypes).map(([type, count]) => ({
    name: formatEventType(type),
    value: count,
    type
  })) : [];

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Anti-Raid Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button
                onClick={fetchData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex space-x-4 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'events', label: 'Event Stream', icon: Clock },
            { id: 'guilds', label: 'Guild Stats', icon: Server }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Events</p>
                <p className="text-2xl font-bold text-white">{stats?.totalEvents || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Recent (24h)</p>
                <p className="text-2xl font-bold text-white">{stats?.recentEvents || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Raids Detected</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.eventTypes?.raid_detected || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Active Guilds</p>
                <p className="text-2xl font-bold text-white">
                  {stats ? Object.keys(stats.guildStats).length : 0}
                </p>
              </div>
              <Server className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Activity Chart */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">Activity Timeline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeries}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="label" stroke="#ffffff80" />
                  <YAxis stroke="#ffffff80" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorActivity)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Event Types Distribution */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-6">Event Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: PieLabelRenderProps) => {
                        const percent = props.percent || 0;
                        return `${props.name} ${(percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Hourly Activity */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-6">24H Activity Pattern</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.hourlyActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#ffffff80"
                      tickFormatter={(value: string) => new Date(value).getHours() + ':00'}
                    />
                    <YAxis stroke="#ffffff80" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      labelFormatter={(value: string) => `Time: ${new Date(value).toLocaleTimeString()}`}
                    />
                    <Bar dataKey="count" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Recent Events</h3>
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All Events</option>
                {stats && Object.keys(stats.eventTypes).map(type => (
                  <option key={type} value={type}>{formatEventType(type)}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentEvents
                .filter(event => selectedEventType === 'all' || event.eventType === selectedEventType)
                .map((event, index) => (
                <div key={event.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getEventTypeIcon(event.eventType)}
                      <div>
                        <p className="text-white font-medium">{formatEventType(event.eventType)}</p>
                        <p className="text-white/60 text-sm">
                          Guild: {event.data?.guildId || 'Unknown'} | 
                          {event.data?.triggerType && ` Trigger: ${event.data.triggerType} |`}
                          {event.data?.joinCount && ` Joins: ${event.data.joinCount}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-sm">{formatTimestamp(event.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'guilds' && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-6">Top Guilds by Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/80 py-3 px-4">Guild ID</th>
                    <th className="text-left text-white/80 py-3 px-4">Total Events</th>
                    <th className="text-left text-white/80 py-3 px-4">Raids Detected</th>
                    <th className="text-left text-white/80 py-3 px-4">Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.topGuilds.map((guild, index) => (
                    <tr key={guild.guildId} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4 text-white font-mono text-sm">
                        {guild.guildId.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-white">{guild.total}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          guild.raids > 0 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                        }`}>
                          {guild.raids}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/60 text-sm">
                        {formatTimestamp(guild.lastActivity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}