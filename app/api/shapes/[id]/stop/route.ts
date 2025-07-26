import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ShapeConfig } from '@/types/shape'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await connectToDatabase()
  const shapes = db.collection<ShapeConfig>('shapes')
  
  await shapes.updateOne(
    { id: params.id },
    { $set: { action: 'stop', status: 'offline' } }
  )
  
  return NextResponse.json({ success: true })
}
