// app/api/github-heatmap/route.ts
// Public use
import { NextRequest, NextResponse } from 'next/server'

interface ContributionDay {
  date: string
  count: number
  level: number
}

async function fetchGitHubContributions(username: string): Promise<ContributionDay[]> {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { username }
    }),
    next: { revalidate: 3600 } // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (data.errors) {
    throw new Error(data.errors[0].message)
  }

  const weeks = data.data.user.contributionsCollection.contributionCalendar.weeks
  const days: ContributionDay[] = []

  weeks.forEach((week: any) => {
    week.contributionDays.forEach((day: any) => {
      let level = 0
      if (day.contributionCount > 0) level = 1
      if (day.contributionCount >= 3) level = 2
      if (day.contributionCount >= 6) level = 3
      if (day.contributionCount >= 10) level = 4

      days.push({
        date: day.date,
        count: day.contributionCount,
        level
      })
    })
  })

  return days
}

function generateHeatmapSVG(
  days: ContributionDay[],
  options: {
    color: string
    bgColor: string
    showStats: boolean
    theme: 'default' | 'compact' | 'minimal'
  }
): string {
  const { color, bgColor, showStats, theme } = options
  
  // Calculate total contributions
  const totalContributions = days.reduce((sum, day) => sum + day.count, 0)
  const maxStreak = calculateMaxStreak(days)
  
  // Color intensity levels
  const colors = [
    '#161b22', // level 0 (no contributions)
    adjustColorOpacity(color, 0.3), // level 1
    adjustColorOpacity(color, 0.5), // level 2
    adjustColorOpacity(color, 0.7), // level 3
    color // level 4
  ]

  // Group days into weeks
  const weeks: ContributionDay[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const cellSize = theme === 'compact' ? 10 : 12
  const cellGap = theme === 'compact' ? 3 : 4
  const width = weeks.length * (cellSize + cellGap) + 80
  const height = theme === 'minimal' ? 120 : (showStats ? 200 : 150)

  let svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .title { font: 600 14px 'Segoe UI', 'Arial', sans-serif; fill: #c9d1d9; }
          .stat { font: 400 12px 'Segoe UI', 'Arial', sans-serif; fill: #8b949e; }
          .cell { rx: 2; }
          .cell:hover { stroke: ${color}; stroke-width: 1.5; opacity: 0.8; }
        </style>
      </defs>
      
      <rect width="${width}" height="${height}" fill="${bgColor}" rx="6"/>
  `

  // Title
  if (theme !== 'minimal') {
    svg += `<text x="15" y="25" class="title">GitHub Contributions</text>`
  }

  // Draw heatmap
  const startY = theme === 'minimal' ? 20 : 45
  weeks.forEach((week, weekIndex) => {
    week.forEach((day, dayIndex) => {
      const x = 15 + weekIndex * (cellSize + cellGap)
      const y = startY + dayIndex * (cellSize + cellGap)
      
      svg += `
        <rect 
          class="cell"
          x="${x}" 
          y="${y}" 
          width="${cellSize}" 
          height="${cellSize}" 
          fill="${colors[day.level]}"
        >
          <title>${day.date}: ${day.count} contributions</title>
        </rect>
      `
    })
  })

  // stats xd
  if (showStats && theme !== 'minimal') {
    const statsY = startY + 90
    svg += `
      <text x="15" y="${statsY}" class="stat">
        Total: ${totalContributions} contributions
      </text>
      <text x="15" y="${statsY + 20}" class="stat">
        Longest streak: ${maxStreak} days
      </text>
    `
    
    // Legend
    const legendY = statsY + 45
    svg += `<text x="15" y="${legendY}" class="stat">Less</text>`
    colors.forEach((c, i) => {
      svg += `
        <rect 
          x="${60 + i * (cellSize + cellGap)}" 
          y="${legendY - 10}" 
          width="${cellSize}" 
          height="${cellSize}" 
          fill="${c}"
          rx="2"
        />
      `
    })
    svg += `<text x="${60 + colors.length * (cellSize + cellGap) + 10}" y="${legendY}" class="stat">More</text>`
  }

  svg += '</svg>'
  return svg
}

function adjustColorOpacity(hex: string, opacity: number): string {
  hex = hex.replace('#', '')
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Mix with dark background
  const bgR = 22, bgG = 27, bgB = 34
  const mixR = Math.round(bgR + (r - bgR) * opacity)
  const mixG = Math.round(bgG + (g - bgG) * opacity)
  const mixB = Math.round(bgB + (b - bgB) * opacity)
  return `rgb(${mixR}, ${mixG}, ${mixB})`
}

function calculateMaxStreak(days: ContributionDay[]): number {
  let maxStreak = 0
  let currentStreak = 0
  days.forEach(day => {
    if (day.count > 0) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  })
  return maxStreak
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('user')
    
    if (!username) {
      return new NextResponse('Missing username parameter', { status: 400 })
    }

    // Customization options
    const color = searchParams.get('color') || '6366F1'
    const bgColor = searchParams.get('bg') || '0D1117'
    const showStats = searchParams.get('stats') !== 'false'
    const theme = (searchParams.get('theme') || 'default') as 'default' | 'compact' | 'minimal'
    const contributions = await fetchGitHubContributions(username)
    const svg = generateHeatmapSVG(contributions, {
      color: `#${color}`,
      bgColor: `#${bgColor}`,
      showStats,
      theme
    })

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })

  } catch (error: any) {
    console.error('[GITHUB-HEATMAP] Error:', error)
        const errorSvg = `
      <svg width="600" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="100" fill="#0D1117" rx="6"/>
        <text x="300" y="50" text-anchor="middle" font-family="Segoe UI" font-size="14" fill="#f85149">
          Error: ${error.message || 'Failed to fetch GitHub data'}
        </text>
      </svg>
    `
    
    return new NextResponse(errorSvg, {
      status: 500,
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}