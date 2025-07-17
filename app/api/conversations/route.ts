// /api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const conversations = await db
      .collection('conversations')
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();
    // Convert _id to id for frontend
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
    const conversation = await req.json();
    const db = await getDatabase();
    const doc = {
      ...conversation,
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