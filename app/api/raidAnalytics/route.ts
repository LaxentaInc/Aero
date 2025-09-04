// app/api/raidAnalytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, Collection } from 'mongodb';

// Database connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/antiraid');
  await client.connect();
  
  const db = client.db('antiraid_analytics');
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

interface AnalyticsEvent {
  eventType: string;
  data: any;
  timestamp: number;
  id: string;
  guildId?: string;
  processedAt: number;
}

interface BatchPayload {
  events: AnalyticsEvent[];
  batchId: string;
  timestamp: number;
  isRetry?: boolean;
}

class DatabaseAnalyticsStore {
  private db: Db;
  private eventsCollection: Collection<AnalyticsEvent>;

  constructor(db: Db) {
    this.db = db;
    this.eventsCollection = db.collection('analytics_events');
    
    // Create indexes for better performance
    this.createIndexes();
  }

  private async createIndexes() {
    try {
      await this.eventsCollection.createIndex({ timestamp: -1 });
      await this.eventsCollection.createIndex({ eventType: 1 });
      await this.eventsCollection.createIndex({ guildId: 1 });
      await this.eventsCollection.createIndex({ "data.guildId": 1 });
      
      // TTL index to auto-delete old events after 90 days
      await this.eventsCollection.createIndex(
        { timestamp: 1 }, 
        { expireAfterSeconds: 90 * 24 * 60 * 60 }
      );
      
      console.log('[Analytics API] Database indexes created');
    } catch (error) {
      console.error('[Analytics API] Error creating indexes:', error);
    }
  }

  async addEvents(events: AnalyticsEvent[]) {
    try {
      // Add processing timestamp and extract guildId for easier querying
      const processedEvents = events.map(event => ({
        ...event,
        processedAt: Date.now(),
        guildId: event.data?.guildId || null
      }));

      const result = await this.eventsCollection.insertMany(processedEvents);
      console.log(`[Analytics API] Inserted ${result.insertedCount} events into database`);
      return result;
    } catch (error) {
      console.error('[Analytics API] Error inserting events:', error);
      throw error;
    }
  }

  async getEvents(limit: number = 100, eventType?: string, guildId?: string, timeRange?: { start: number; end: number }) {
    try {
      const query: any = {};

      if (eventType) {
        query.eventType = eventType;
      }

      if (guildId) {
        query.$or = [
          { guildId: guildId },
          { "data.guildId": guildId }
        ];
      }

      if (timeRange) {
        query.timestamp = { 
          $gte: timeRange.start, 
          $lte: timeRange.end 
        };
      }

      const events = await this.eventsCollection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      return events;
    } catch (error) {
      console.error('[Analytics API] Error fetching events:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

      // Use MongoDB aggregation for efficient statistics
      const [
        totalEvents,
        recentEvents,
        weeklyEvents,
        eventTypeStats,
        guildStats,
        hourlyActivity
      ] = await Promise.all([
        // Total events count
        this.eventsCollection.countDocuments(),
        
        // Recent events count (24h)
        this.eventsCollection.countDocuments({ 
          timestamp: { $gte: oneDayAgo } 
        }),
        
        // Weekly events count
        this.eventsCollection.countDocuments({ 
          timestamp: { $gte: oneWeekAgo } 
        }),
        
        // Event type distribution
        this.eventsCollection.aggregate([
          { $group: { _id: "$eventType", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]).toArray(),
        
        // Guild statistics
        this.eventsCollection.aggregate([
          { 
            $match: { 
              $or: [
                { guildId: { $exists: true, $ne: null } },
                { "data.guildId": { $exists: true, $ne: null } }
              ]
            }
          },
          {
            $group: {
              _id: { $ifNull: ["$guildId", "$data.guildId"] },
              total: { $sum: 1 },
              raids: { 
                $sum: { 
                  $cond: [{ $eq: ["$eventType", "raid_detected"] }, 1, 0] 
                }
              },
              lastActivity: { $max: "$timestamp" }
            }
          },
          { $sort: { total: -1 } },
          { $limit: 20 }
        ]).toArray(),
        
        // Hourly activity for last 24 hours
        this.eventsCollection.aggregate([
          { 
            $match: { 
              timestamp: { $gte: oneDayAgo } 
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d-%H",
                  date: { $toDate: "$timestamp" }
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]).toArray()
      ]);

      // Process event types
      const eventTypes = eventTypeStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>);

      // Process guild stats
      const processedGuildStats = guildStats.reduce((acc, item) => {
        acc[item._id] = {
          total: item.total,
          raids: item.raids,
          lastActivity: item.lastActivity
        };
        return acc;
      }, {} as Record<string, { total: number; raids: number; lastActivity: number }>);

      // Process hourly activity (fill missing hours with 0)
      const hourlyMap = new Map();
      hourlyActivity.forEach(item => {
        hourlyMap.set(item._id, item.count);
      });

      const processedHourlyActivity = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date(now - (i * 60 * 60 * 1000));
        hour.setMinutes(0, 0, 0);
        const hourKey = hour.toISOString().slice(0, 13).replace('T', '-');
        
        return {
          hour: hour.toISOString(),
          count: hourlyMap.get(hourKey) || 0
        };
      }).reverse();

      // Top guilds
      const topGuilds = guildStats.slice(0, 10).map(item => ({
        guildId: item._id,
        total: item.total,
        raids: item.raids,
        lastActivity: item.lastActivity
      }));

      return {
        totalEvents,
        recentEvents,
        weeklyEvents,
        eventTypes,
        guildStats: processedGuildStats,
        hourlyActivity: processedHourlyActivity,
        topGuilds
      };
    } catch (error) {
      console.error('[Analytics API] Error fetching stats:', error);
      throw error;
    }
  }

  async getTimeSeries(eventType?: string, interval: 'hour' | 'day' = 'hour', days = 7) {
    try {
      const now = Date.now();
      const intervalMs = interval === 'hour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const periods = interval === 'hour' ? days * 24 : days;
      const startTime = now - (periods * intervalMs);

      const matchStage: any = {
        timestamp: { $gte: startTime }
      };

      if (eventType) {
        matchStage.eventType = eventType;
      }

      const dateFormat = interval === 'hour' ? "%Y-%m-%d-%H" : "%Y-%m-%d";

      const timeSeriesData = await this.eventsCollection.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: { $toDate: "$timestamp" }
              }
            },
            count: { $sum: 1 },
            timestamp: { 
              $min: "$timestamp" 
            }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();

      // Fill missing periods with 0
      const dataMap = new Map();
      timeSeriesData.forEach(item => {
        dataMap.set(item._id, { count: item.count, timestamp: item.timestamp });
      });

      return Array.from({ length: periods }, (_, i) => {
        const periodStart = startTime + (i * intervalMs);
        const date = new Date(periodStart);
        
        let dateKey: string;
        if (interval === 'hour') {
          date.setMinutes(0, 0, 0);
          dateKey = date.toISOString().slice(0, 13).replace('T', '-');
        } else {
          date.setHours(0, 0, 0, 0);
          dateKey = date.toISOString().slice(0, 10);
        }

        const data = dataMap.get(dateKey) || { count: 0, timestamp: periodStart };

        return {
          timestamp: periodStart,
          date: new Date(periodStart).toISOString(),
          count: data.count,
          label: interval === 'hour' 
            ? new Date(periodStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : new Date(periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
      });
    } catch (error) {
      console.error('[Analytics API] Error fetching time series:', error);
      throw error;
    }
  }

  // Clean up old events (optional, since we have TTL index)
  async cleanupOldEvents(daysToKeep = 90) {
    try {
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      const result = await this.eventsCollection.deleteMany({
        timestamp: { $lt: cutoffTime }
      });
      
      console.log(`[Analytics API] Cleaned up ${result.deletedCount} old events`);
      return result;
    } catch (error) {
      console.error('[Analytics API] Error cleaning up events:', error);
      throw error;
    }
  }
}

// POST endpoint to receive analytics data from Discord bot
export async function POST(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const store = new DatabaseAnalyticsStore(db);
    
    const body: BatchPayload = await req.json();
    
    console.log(`[Analytics API] Received batch: ${body.batchId} with ${body.events.length} events`);
    
    // Validate payload
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Invalid payload: events array required' },
        { status: 400 }
      );
    }

    // Store events in database
    await store.addEvents(body.events);

    // Log event types for debugging
    const eventTypes = body.events.map(e => e.eventType).join(', ');
    console.log(`[Analytics API] Stored events: ${eventTypes}`);

    return NextResponse.json({
      success: true,
      message: `Stored ${body.events.length} events`,
      batchId: body.batchId,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[Analytics API] Error processing batch:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve analytics data for dashboard
export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const store = new DatabaseAnalyticsStore(db);
    
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'stats';
    
    switch (action) {
      case 'stats':
        const stats = await store.getStats();
        return NextResponse.json(stats);
      
      case 'events':
        const limit = parseInt(searchParams.get('limit') || '100');
        const eventType = searchParams.get('eventType') || undefined;
        const guildId = searchParams.get('guildId') || undefined;
        
        let timeRange;
        const startTime = searchParams.get('startTime');
        const endTime = searchParams.get('endTime');
        if (startTime && endTime) {
          timeRange = { start: parseInt(startTime), end: parseInt(endTime) };
        }
        
        const events = await store.getEvents(limit, eventType, guildId, timeRange);
        return NextResponse.json({ events });
      
      case 'timeseries':
        const seriesEventType = searchParams.get('eventType') || undefined;
        const interval = (searchParams.get('interval') as 'hour' | 'day') || 'hour';
        const days = parseInt(searchParams.get('days') || '7');
        
        const timeSeries = await store.getTimeSeries(seriesEventType, interval, days);
        return NextResponse.json({ timeSeries });

      case 'cleanup':
        const daysToKeep = parseInt(searchParams.get('days') || '90');
        const cleanupResult = await store.cleanupOldEvents(daysToKeep);
        return NextResponse.json({ 
          message: `Cleaned up ${cleanupResult.deletedCount} old events`,
          deletedCount: cleanupResult.deletedCount
        });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Valid actions: stats, events, timeseries, cleanup' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Analytics API] Error retrieving data:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Optional: Add a health check endpoint
export async function HEAD() {
  try {
    const { db } = await connectToDatabase();
    await db.admin().ping();
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}