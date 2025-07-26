import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ShapeConfig } from '@/types/shape'

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await connectToDatabase()
  const shapes = db.collection<ShapeConfig>('shapes')
  
  await shapes.updateOne(
    { id: context.params.id },
    { $set: { action: 'create', status: 'pending' } }
  )
  
  return NextResponse.json({ success: true })
}