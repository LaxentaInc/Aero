import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const db = await getDatabase();
    let conversation = await db.collection('conversations').findOne({ id });
    if (!conversation && ObjectId.isValid(id)) {
      conversation = await db.collection('conversations').findOne({ _id: new ObjectId(id) });
    }
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    return NextResponse.json({
      ...conversation,
      id: conversation.id || conversation._id?.toString(),
      _id: undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const conversation = await req.json();
    const db = await getDatabase();
    const updateDoc = {
      ...conversation,
      createdAt: new Date(conversation.createdAt),
      updatedAt: new Date(conversation.updatedAt),
      messages: conversation.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    };
    delete updateDoc._id;
    await db.collection('conversations').updateOne(
      { id },
      { $set: updateDoc },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const db = await getDatabase();
    const result = await db.collection('conversations').deleteOne({ id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}