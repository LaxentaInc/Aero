// api/shapes/[id]/stop/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ShapeConfig } from '@/types/shape'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const db = await connectToDatabase()
  const shapes = db.collection<ShapeConfig>('shapes')
  
  await shapes.updateOne(
    { id },
    { $set: { action: 'stop', status: 'offline' } }
  )
  
  return NextResponse.json({ success: true })
}