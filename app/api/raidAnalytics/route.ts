// app/api/raidAnalytics/route.ts
import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (replace with your database)
interface AnalyticsEvent {
  eventType: string;
  data: any;
  timestamp: number;
  id: string;
}

interface BatchPayload {
  events: AnalyticsEvent[];
  batchId: string;
  timestamp: number;
  isRetry?: boolean;
}

// Simple in-memory store (replace with your database)
class AnalyticsStore {
  private events: AnalyticsEvent[] = [];
  private readonly maxEvents = 10000; // Keep last 10k events

  addEvents(events: AnalyticsEvent[]) {
    this.events.push(...events);
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  getEvents(limit?: number, eventType?: string, guildId?: string, timeRange?: { start: number; end: number }) {
    let filtered = [...this.events];

    // Filter by event type
    if (eventType) {
      filtered = filtered.filter(e => e.eventType === eventType);
    }

    // Filter by guild ID
    if (guildId) {
      filtered = filtered.filter(e => e.data?.guildId === guildId);
    }

    // Filter by time range
    if (timeRange) {
      filtered = filtered.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }

  getStats() {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(e => e.timestamp >= oneDayAgo);
    const weeklyEvents = this.events.filter(e => e.timestamp >= oneWeekAgo);

    // Event type distribution
    const eventTypeCounts = this.events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Guild statistics
    const guildStats = this.events.reduce((acc, event) => {
      if (event.data?.guildId) {
        if (!acc[event.data.guildId]) {
          acc[event.data.guildId] = { total: 0, raids: 0, lastActivity: 0 };
        }
        acc[event.data.guildId].total++;
        if (event.eventType === 'raid_detected') {
          acc[event.data.guildId].raids++;
        }
        acc[event.data.guildId].lastActivity = Math.max(
          acc[event.data.guildId].lastActivity,
          event.timestamp
        );
      }
      return acc;
    }, {} as Record<string, { total: number; raids: number; lastActivity: number }>);

    // Hourly activity for last 24 hours
    const hourlyActivity = Array.from({ length: 24 }, (_, i) => {
      const hour = now - (i * 60 * 60 * 1000);
      const hourStart = hour - (hour % (60 * 60 * 1000));
      const hourEnd = hourStart + (60 * 60 * 1000);
      
      const count = this.events.filter(e => 
        e.timestamp >= hourStart && e.timestamp < hourEnd
      ).length;

      return {
        hour: new Date(hourStart).toISOString(),
        count
      };
    }).reverse();

    return {
      totalEvents: this.events.length,
      recentEvents: recentEvents.length,
      weeklyEvents: weeklyEvents.length,
      eventTypes: eventTypeCounts,
      guildStats,
      hourlyActivity,
      topGuilds: Object.entries(guildStats)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 10)
        .map(([guildId, stats]) => ({ guildId, ...stats }))
    };
  }

  // Get time-series data for charts
  getTimeSeries(eventType?: string, interval: 'hour' | 'day' = 'hour', days = 7) {
    const now = Date.now();
    const intervalMs = interval === 'hour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const periods = interval === 'hour' ? days * 24 : days;
    
    let events = eventType 
      ? this.events.filter(e => e.eventType === eventType)
      : this.events;

    return Array.from({ length: periods }, (_, i) => {
      const periodEnd = now - (i * intervalMs);
      const periodStart = periodEnd - intervalMs;
      
      const count = events.filter(e => 
        e.timestamp >= periodStart && e.timestamp < periodEnd
      ).length;

      return {
        timestamp: periodStart,
        date: new Date(periodStart).toISOString(),
        count,
        label: interval === 'hour' 
          ? new Date(periodStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : new Date(periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    }).reverse();
  }
}

const store = new AnalyticsStore();

// POST endpoint to receive analytics data from Discord bot
export async function POST(req: NextRequest) {
  try {
    const body: BatchPayload = await req.json();
    
    console.log(`[Analytics API] Received batch: ${body.batchId} with ${body.events.length} events`);
    
    // Validate payload
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Invalid payload: events array required' },
        { status: 400 }
      );
    }

    // Store events
    store.addEvents(body.events);

    // Log event types for debugging
    const eventTypes = body.events.map(e => e.eventType).join(', ');
    console.log(`[Analytics API] Stored events: ${eventTypes}`);

    return NextResponse.json({
      success: true,
      message: `Stored ${body.events.length} events`,
      batchId: body.batchId
    });

  } catch (error) {
    console.error('[Analytics API] Error processing batch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve analytics data for dashboard
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'stats';
    
    switch (action) {
      case 'stats':
        return NextResponse.json(store.getStats());
      
      case 'events':
        const limit = parseInt(searchParams.get('limit') || '100');
        const eventType = searchParams.get('eventType') || undefined;
        const guildId = searchParams.get('guildId') || undefined;
        
        const events = store.getEvents(limit, eventType, guildId);
        return NextResponse.json({ events });
      
      case 'timeseries':
        const seriesEventType = searchParams.get('eventType') || undefined;
        const interval = (searchParams.get('interval') as 'hour' | 'day') || 'hour';
        const days = parseInt(searchParams.get('days') || '7');
        
        const timeSeries = store.getTimeSeries(seriesEventType, interval, days);
        return NextResponse.json({ timeSeries });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Analytics API] Error retrieving data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}