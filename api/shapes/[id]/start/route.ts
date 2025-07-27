import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Please login' }, { status: 401 })
  const db = await connectToDatabase()
  // ...existing code to verify ownership of the shape...
  await db.collection('shapes').updateOne(
    { id: params.id },
    { $set: { action: 'create', status: 'pending' } }
  )
  return NextResponse.json({ success: true })
}
