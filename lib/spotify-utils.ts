import { MongoClient } from 'mongodb'

interface UserTokenDoc {
  userId: string
  accessToken: string
  refreshToken: string
  expiresAt: number
  spotifyId: string
  displayName: string
  createdAt: Date
  updatedAt: Date
}

let cachedClient: MongoClient | null = null

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }

  const client = await MongoClient.connect(process.env.MONGO_URI!)
  cachedClient = client
  return client
}

export async function updateUserTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
  spotifyId?: string,
  displayName?: string
) {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<UserTokenDoc>('spotify_tokens')
  
  await collection.updateOne(
    { userId },
    {
      $set: {
        accessToken,
        refreshToken,
        expiresAt,
        updatedAt: new Date(),
        ...(spotifyId && { spotifyId }),
        ...(displayName && { displayName }),
      },
      $setOnInsert: {
        userId,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  )
}

export async function getUserTokens(userId: string): Promise<UserTokenDoc | null> {
  const client = await connectToDatabase()
  const db = client.db()
  const collection = db.collection<UserTokenDoc>('spotify_tokens')
  
  return await collection.findOne({ userId })
}

// Helper function to save user tokens after OAuth
export async function saveUserTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
  spotifyId: string,
  displayName: string
) {
  await updateUserTokens(userId, accessToken, refreshToken, expiresAt, spotifyId, displayName)
}