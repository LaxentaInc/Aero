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
      'o3-turbo'
    ]

    const BLOCKED_MODEL_PATTERNS = [
    //   /opus/i,
    //   /turbo/i,
      /^gpt-4-/,
    //   /claude-3\.5/i,
    /o3/,
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