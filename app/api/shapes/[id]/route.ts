// /api/shapes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // await the params!
  
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Please login' }, { status: 401 })
  }

  const db = await connectToDatabase()
  const shapes = db.collection('shapes')
  
  const shape = await shapes.findOne({ 
    id: id,
    userId: session.user.id 
  })
  
  if (!shape) {
    return NextResponse.json({ error: 'Shape not found' }, { status: 404 })
  }
  
  return NextResponse.json({ success: true, shape })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // await the params!
  
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Please login' }, { status: 401 })
  }

  const db = await connectToDatabase()
  const shapes = db.collection('shapes')
  
  const shape = await shapes.findOne({ 
    id: id,
    userId: session.user.id 
  })
  
  if (!shape) {
    return NextResponse.json({ error: 'Shape not found' }, { status: 404 })
  }

  await shapes.updateOne(
    { id: id },
    { $set: { action: 'stop' } }
  )
  
  setTimeout(async () => {
    await shapes.deleteOne({ id: id })
  }, 10000)
  
  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // await the params!
  
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Please login' }, { status: 401 })
  }

  const db = await connectToDatabase()
  const shapes = db.collection('shapes')
  
  const { isPublic, description, tags, model, instruction, limit } = await req.json()
  
  const updateData: any = {
    updatedAt: new Date()
  }
  
  if (isPublic !== undefined) updateData.isPublic = isPublic
  if (description !== undefined) updateData.description = description
  if (tags !== undefined) updateData.tags = tags
  if (model !== undefined) updateData.model = model
  if (instruction !== undefined) updateData.instruction = instruction
  if (limit !== undefined) updateData.limit = Math.min(limit, 15)
  
  if (model || instruction || limit) {
    updateData.action = 'update'
  }
  
  const result = await shapes.updateOne(
    { id: id, userId: session.user.id },
    { $set: updateData }
  )
  
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Shape not found' }, { status: 404 })
  }
  
  return NextResponse.json({ success: true })
}