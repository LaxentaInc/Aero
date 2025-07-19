// /api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // If no session, return empty array (guests don't have saved conversations)
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    const db = await getDatabase();
    const conversations = await db
      .collection('conversations')
      .find({ userId: session.user.id }) // Filter by user's Discord ID
      .sort({ updatedAt: -1 })
      .toArray();
    
    const result = conversations.map(conv => ({
      ...conv,
      id: conv.id || conv._id?.toString(),
      _id: undefined,
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Don't save conversations for guests
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const conversation = await req.json();
    const db = await getDatabase();
    const doc = {
      ...conversation,
      userId: session.user.id, // Add user's Discord ID
      createdAt: new Date(conversation.createdAt),
      updatedAt: new Date(conversation.updatedAt),
      messages: conversation.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    };
    const result = await db.collection('conversations').insertOne(doc);
    return NextResponse.json({ success: true, id: doc.id, _id: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}