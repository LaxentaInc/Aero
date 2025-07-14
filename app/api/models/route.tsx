import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch from the original API
    const response = await fetch('https://api.electronhub.ai/models')
    const data = await response.json()

    // Your blocking rules
    const BLOCKED_MODEL_IDS = [
      'claude-3-opus-20240229',
      'gpt-4-turbo-preview',
      'gpt-4-vision-preview',
      'anthropic/claude-3.5-sonnet:beta',
      'o1',
      'o3-turbo',
      'gpt-3.5-turbo'
    ]

const BLOCKED_MODEL_PATTERNS = [
  /^gpt-4[.]?5/i,     // Matches "gpt-4.5", "gpt-45", "gpt-4.5-turbo", etc.
  /^gpt-4[.]?1/i,     // Matches "gpt-4.1", "gpt-41", "gpt-4.1-mini", etc.
  /o3/i,              // Matches anything with "o3" in it (case-insensitive)
]


    // Filter the models
    const filteredModels = {
      ...data,
      data: data.data.filter((model: any) => 
        !BLOCKED_MODEL_IDS.includes(model.id) &&
        !BLOCKED_MODEL_PATTERNS.some(pattern => 
          pattern.test(model.id) || pattern.test(model.name)
        )
      )
    }

    return NextResponse.json(filteredModels)
  } catch (error) {
    console.error('Failed to fetch models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}