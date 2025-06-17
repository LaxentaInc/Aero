import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const BOTS_DIR = path.join(process.cwd(), 'data', 'bots')

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = authHeader.split('Bearer ')[1]
  const userBotsFile = path.join(BOTS_DIR, `${userId}.json`)

  try {
    const botsData = await fs.readFile(userBotsFile, 'utf-8')
    const bots = JSON.parse(botsData)
    return NextResponse.json({ bots })
  } catch (error) {
    return NextResponse.json({ bots: [] })
  }
}
