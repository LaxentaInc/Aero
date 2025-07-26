export interface ShapeConfig {
  id: string;
  token: string;
  status: 'online' | 'offline' | 'error' | 'starting' | 'pending' | 'creating' | 'failed';
  action?: 'create' | 'stop' | 'update';
  error?: string;
  config: {
    model: string
    limit: number
    instruction: string
  }
  discordInfo?: {
    id: string
    username: string
    avatar: string | null
    discriminator: string
  }
  createdAt: string
  updatedAt?: string
  guilds: number
  isPublic?: boolean
  description?: string
  tags?: string[]
  userId?: string
}
