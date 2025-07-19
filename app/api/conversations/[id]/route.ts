import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = await getDatabase();
    // Find conversation by ID AND userId to ensure ownership
    let conversation = await db.collection('conversations').findOne({ 
      id, 
      userId: session.user.id 
    });
    
    if (!conversation && ObjectId.isValid(id)) {
      conversation = await db.collection('conversations').findOne({ 
        _id: new ObjectId(id),
        userId: session.user.id 
      });
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const conversation = await req.json();
    const db = await getDatabase();
    
    // Check if user owns this conversation
    const existing = await db.collection('conversations').findOne({ 
      id, 
      userId: session.user.id 
    });
    
    if (!existing) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const updateDoc = {
      ...conversation,
      userId: session.user.id, // Ensure userId stays the same
      createdAt: new Date(conversation.createdAt),
      updatedAt: new Date(conversation.updatedAt),
      messages: conversation.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    };
    delete updateDoc._id;
    
    await db.collection('conversations').updateOne(
      { id, userId: session.user.id },
      { $set: updateDoc }
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = await getDatabase();
    // Only delete if user owns the conversation
    const result = await db.collection('conversations').deleteOne({ 
      id, 
      userId: session.user.id 
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}