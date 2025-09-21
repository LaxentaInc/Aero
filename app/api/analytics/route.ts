// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, Collection } from 'mongodb';

// Types for our analytics data
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
  _id?: any;
}

interface AnalyticsResponse {
  success: boolean;
  data?: {
    events: AnalyticsEvent[];
    summary: {
      totalEvents: number;
      dateRange: {
        start: number;
        end: number;
      };
      eventTypes: Record<string, number>;
      guilds: Record<string, number>;
      topGuilds: Array<{ guildId: string; count: number; name?: string }>;
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
  };
  error?: string;
  timestamp: number;
}

// MongoDB connection singleton
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db; collection: Collection<AnalyticsEvent> }> {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/antiraid';
  
  if (cachedClient && cachedDb) {
    return {
      client: cachedClient,
      db: cachedDb,
      collection: cachedDb.collection<AnalyticsEvent>('events_backup')
    };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  
  const db = client.db('antiraid_analytics_local');
  const collection = db.collection<AnalyticsEvent>('events_backup');

  cachedClient = client;
  cachedDb = db;

  return { client, db, collection };
}

// GET handler - fetch analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000); // Max 1000
    const eventType = searchParams.get('eventType');
    const guildId = searchParams.get('guildId');
    const startTime = searchParams.get('startTime') ? parseInt(searchParams.get('startTime')!) : null;
    const endTime = searchParams.get('endTime') ? parseInt(searchParams.get('endTime')!) : null;
    const sortBy = searchParams.get('sortBy') || 'timestamp';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const includeSummary = searchParams.get('summary') !== 'false';

    const { collection } = await connectToDatabase();

    // Build MongoDB query
    const query: any = {};
    
    if (eventType) query.eventType = eventType;
    if (guildId) query.guildId = guildId;
    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) query.timestamp.$gte = startTime;
      if (endTime) query.timestamp.$lte = endTime;
    }

    // Get total count for pagination
    const totalEvents = await collection.countDocuments(query);

    // Fetch events with pagination
    const events = await collection
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Clean up MongoDB _id field
    const cleanEvents = events.map(event => {
      const { _id, ...cleanEvent } = event;
      return cleanEvent;
    });

    let summary = null;

    // Generate summary statistics if requested
    if (includeSummary) {
      const summaryQuery = startTime || endTime ? query : {};
      
      // Get event type counts
      const eventTypePipeline = [
        { $match: summaryQuery },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ];
      const eventTypeResults = await collection.aggregate(eventTypePipeline).toArray();
      const eventTypes = Object.fromEntries(
        eventTypeResults.map(item => [item._id, item.count])
      );

      // Get guild counts
      const guildPipeline = [
        { $match: { ...summaryQuery, guildId: { $ne: null } } },
        { $group: { _id: '$guildId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ];
      const guildResults = await collection.aggregate(guildPipeline).toArray();
      const guilds = Object.fromEntries(
        guildResults.map(item => [item._id, item.count])
      );
      const topGuilds = guildResults.map(item => ({
        guildId: item._id,
        count: item.count
      }));

      // Get recent activity (last 24 hours by hour)
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      const activityPipeline = [
        { 
          $match: { 
            timestamp: { $gte: oneDayAgo },
            ...summaryQuery 
          } 
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d %H:00',
                date: { $toDate: '$timestamp' }
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ];
      const activityResults = await collection.aggregate(activityPipeline).toArray();
      const recentActivity = activityResults.map(item => ({
        hour: item._id,
        count: item.count
      }));

      // Raid-specific statistics
      const raidPipeline = [
        { $match: { eventType: 'raid_detected', ...summaryQuery } },
        {
          $group: {
            _id: null,
            totalRaids: { $sum: 1 },
            avgJoinRate: { $avg: '$data.joinCount' },
            triggerTypes: { $push: '$data.triggerType' }
          }
        }
      ];
      const raidResults = await collection.aggregate(raidPipeline).toArray();
      const raidData = raidResults[0] || { totalRaids: 0, avgJoinRate: 0, triggerTypes: [] };
      
      // Count trigger types
      const triggerTypeCounts: Record<string, number> = {};
      raidData.triggerTypes?.forEach((type: string) => {
        if (type) triggerTypeCounts[type] = (triggerTypeCounts[type] || 0) + 1;
      });

      // Get date range
      const dateRange = await collection.aggregate([
        { $match: summaryQuery },
        {
          $group: {
            _id: null,
            minTime: { $min: '$timestamp' },
            maxTime: { $max: '$timestamp' }
          }
        }
      ]).toArray();

      summary = {
        totalEvents,
        dateRange: {
          start: dateRange[0]?.minTime || now,
          end: dateRange[0]?.maxTime || now
        },
        eventTypes,
        guilds,
        topGuilds,
        recentActivity,
        raidStats: {
          totalRaids: raidData.totalRaids,
          avgJoinRate: Math.round(raidData.avgJoinRate || 0),
          topTriggerTypes: triggerTypeCounts
        }
      };
    }

    const response: AnalyticsResponse = {
      success: true,
      data: {
        events: cleanEvents,
        summary: summary!,
        pagination: {
          page,
          limit,
          total: totalEvents,
          hasMore: (page * limit) < totalEvents
        }
      },
      timestamp: Date.now()
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

  } catch (error) {
    console.error('[Analytics API] Error:', error);
    
    const errorResponse: AnalyticsResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: Date.now()
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

// POST handler - for adding new analytics events (optional)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events, batchId } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { success: false, error: 'Invalid events data' },
        { status: 400 }
      );
    }

    const { collection } = await connectToDatabase();

    // Insert events
    const result = await collection.insertMany(events, { ordered: false });

    return NextResponse.json({
      success: true,
      data: {
        insertedCount: result.insertedCount,
        batchId,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('[Analytics API] POST Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to insert events',
      timestamp: Date.now()
    }, { status: 500 });
  }
}