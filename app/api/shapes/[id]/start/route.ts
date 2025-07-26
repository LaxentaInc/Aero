import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ShapeConfig } from '@/types/shape'

export async function POST(
  request: NextRequest,
  context: {
    params: { id: string }
  }
) {
  const { id } = context.params
  const db = await connectToDatabase()
  const shapes = db.collection<ShapeConfig>('shapes')
  
  await shapes.updateOne(
    { id },
    { $set: { action: 'create', status: 'pending' } }
  )
  
  return NextResponse.json({ success: true })
}