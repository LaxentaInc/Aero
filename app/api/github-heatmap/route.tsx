// app/api/github-heatmap/route.ts
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
    next: { revalidate: 3600 }
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

function generateLineChart(days: ContributionDay[], color: string, bgColor: string, username: string): string {
  const width = 800
  const height = 400
  const padding = { top: 60, right: 40, bottom: 60, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Aggregate by week
  const weeklyData: { week: string; count: number }[] = []
  for (let i = 0; i < days.length; i += 7) {
    const weekDays = days.slice(i, i + 7)
    const weekCount = weekDays.reduce((sum, d) => sum + d.count, 0)
    weeklyData.push({
      week: weekDays[0].date,
      count: weekCount
    })
  }

  const maxCount = Math.max(...weeklyData.map(d => d.count), 1)
  const totalContributions = days.reduce((sum, day) => sum + day.count, 0)

  // Generate path
  const points = weeklyData.map((d, i) => {
    const x = padding.left + (i / (weeklyData.length - 1)) * chartWidth
    const y = padding.top + chartHeight - (d.count / maxCount) * chartHeight
    return { x, y, count: d.count, week: d.week }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
  
  // Area path
  const areaPath = pathD + ` L ${points[points.length - 1].x},${padding.top + chartHeight} L ${padding.left},${padding.top + chartHeight} Z`

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
        </linearGradient>
        <style>
          .title { font: 600 18px 'Segoe UI', sans-serif; fill: #e6edf3; }
          .subtitle { font: 400 14px 'Segoe UI', sans-serif; fill: #7d8590; }
          .stat-value { font: 700 24px 'Segoe UI', sans-serif; fill: ${color}; }
          .stat-label { font: 400 12px 'Segoe UI', sans-serif; fill: #7d8590; }
          .axis-label { font: 400 11px 'Segoe UI', sans-serif; fill: #7d8590; }
          .grid-line { stroke: #30363d; stroke-width: 1; }
          .data-point { transition: all 0.2s; }
          .data-point:hover { r: 6; }
        </style>
      </defs>
      
      <rect width="${width}" height="${height}" fill="${bgColor}" rx="12"/>
      
      <!-- Header -->
      <text x="30" y="35" class="title">${username}'s Contribution Activity</text>
      <text x="${width - 30}" y="35" text-anchor="end" class="stat-value">${totalContributions}</text>
      <text x="${width - 30}" y="52" text-anchor="end" class="stat-label">Total Contributions</text>
      
      <!-- Grid lines -->
      ${[0, 0.25, 0.5, 0.75, 1].map(ratio => `
        <line 
          x1="${padding.left}" 
          y1="${padding.top + chartHeight * (1 - ratio)}" 
          x2="${width - padding.right}" 
          y2="${padding.top + chartHeight * (1 - ratio)}" 
          class="grid-line"
        />
        <text 
          x="${padding.left - 10}" 
          y="${padding.top + chartHeight * (1 - ratio) + 4}" 
          text-anchor="end" 
          class="axis-label"
        >${Math.round(maxCount * ratio)}</text>
      `).join('')}
      
      <!-- Area under curve -->
      <path d="${areaPath}" fill="url(#lineGradient)" />
      
      <!-- Line -->
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      
      <!-- Data points -->
      ${points.map(p => `
        <circle 
          cx="${p.x}" 
          cy="${p.y}" 
          r="4" 
          fill="${color}" 
          class="data-point"
        >
          <title>${p.week}: ${p.count} contributions</title>
        </circle>
      `).join('')}
      
      <!-- X-axis labels -->
      ${[0, Math.floor(weeklyData.length / 2), weeklyData.length - 1].map(i => {
        const date = new Date(weeklyData[i].week)
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const x = padding.left + (i / (weeklyData.length - 1)) * chartWidth
        return `<text x="${x}" y="${height - 20}" text-anchor="middle" class="axis-label">${label}</text>`
      }).join('')}
    </svg>
  `
}

function generateBarChart(days: ContributionDay[], color: string, bgColor: string, username: string): string {
  const width = 800
  const height = 400
  const padding = { top: 60, right: 40, bottom: 60, left: 60 }
  
  // Group by month
  const monthlyData: { [key: string]: number } = {}
  days.forEach(day => {
    const month = day.date.substring(0, 7) // YYYY-MM
    monthlyData[month] = (monthlyData[month] || 0) + day.count
  })
  
  const months = Object.keys(monthlyData).slice(-12) // Last 12 months
  const counts = months.map(m => monthlyData[m])
  const maxCount = Math.max(...counts, 1)
  const totalContributions = days.reduce((sum, day) => sum + day.count, 0)
  
  const barWidth = (width - padding.left - padding.right) / months.length - 10
  const chartHeight = height - padding.top - padding.bottom

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.6" />
        </linearGradient>
        <style>
          .title { font: 600 18px 'Segoe UI', sans-serif; fill: #e6edf3; }
          .stat-value { font: 700 24px 'Segoe UI', sans-serif; fill: ${color}; }
          .stat-label { font: 400 12px 'Segoe UI', sans-serif; fill: #7d8590; }
          .axis-label { font: 400 11px 'Segoe UI', sans-serif; fill: #7d8590; }
          .bar { transition: all 0.2s; }
          .bar:hover { opacity: 0.8; }
        </style>
      </defs>
      
      <rect width="${width}" height="${height}" fill="${bgColor}" rx="12"/>
      
      <text x="30" y="35" class="title">${username}'s Monthly Contributions</text>
      <text x="${width - 30}" y="35" text-anchor="end" class="stat-value">${totalContributions}</text>
      <text x="${width - 30}" y="52" text-anchor="end" class="stat-label">Total Contributions</text>
      
      ${months.map((month, i) => {
        const count = counts[i]
        const barHeight = (count / maxCount) * chartHeight
        const x = padding.left + i * (barWidth + 10)
        const y = padding.top + chartHeight - barHeight
        const monthLabel = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' })
        
        return `
          <rect 
            class="bar"
            x="${x}" 
            y="${y}" 
            width="${barWidth}" 
            height="${barHeight}" 
            fill="url(#barGradient)"
            rx="4"
          >
            <title>${monthLabel}: ${count} contributions</title>
          </rect>
          <text 
            x="${x + barWidth / 2}" 
            y="${height - 20}" 
            text-anchor="middle" 
            class="axis-label"
          >${monthLabel}</text>
        `
      }).join('')}
    </svg>
  `
}

function generateRadarChart(days: ContributionDay[], color: string, bgColor: string, username: string): string {
  const size = 400
  const center = size / 2
  const radius = 140
  
  // Aggregate by day of week
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayTotals = Array(7).fill(0)
  
  days.forEach(day => {
    const dayOfWeek = new Date(day.date).getDay()
    dayTotals[dayOfWeek] += day.count
  })
  
  const maxValue = Math.max(...dayTotals, 1)
  const totalContributions = days.reduce((sum, day) => sum + day.count, 0)
  
  // Calculate points
  const points = dayTotals.map((value, i) => {
    const angle = (i * 2 * Math.PI / 7) - Math.PI / 2
    const r = (value / maxValue) * radius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      value,
      label: dayNames[i]
    }
  })
  
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ')
  
  // Web lines
  const webLevels = [0.2, 0.4, 0.6, 0.8, 1]
  
  return `
    <svg width="${size}" height="${size + 100}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .title { font: 600 18px 'Segoe UI', sans-serif; fill: #e6edf3; }
          .stat-value { font: 700 20px 'Segoe UI', sans-serif; fill: ${color}; }
          .stat-label { font: 400 12px 'Segoe UI', sans-serif; fill: #7d8590; }
          .day-label { font: 600 12px 'Segoe UI', sans-serif; fill: #e6edf3; }
          .web-line { stroke: #30363d; stroke-width: 1; fill: none; }
        </style>
      </defs>
      
      <rect width="${size}" height="${size + 100}" fill="${bgColor}" rx="12"/>
      
      <text x="${size / 2}" y="35" text-anchor="middle" class="title">${username}'s Activity by Day</text>
      <text x="${size / 2}" y="60" text-anchor="middle" class="stat-value">${totalContributions}</text>
      <text x="${size / 2}" y="78" text-anchor="middle" class="stat-label">Total Contributions</text>
      
      <g transform="translate(0, 90)">
        <!-- Web levels -->
        ${webLevels.map(level => {
          const pts = dayTotals.map((_, i) => {
            const angle = (i * 2 * Math.PI / 7) - Math.PI / 2
            const r = level * radius
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`
          }).join(' ')
          return `<polygon points="${pts}" class="web-line" />`
        }).join('')}
        
        <!-- Axis lines -->
        ${points.map((p, i) => {
          const angle = (i * 2 * Math.PI / 7) - Math.PI / 2
          const endX = center + radius * Math.cos(angle)
          const endY = center + radius * Math.sin(angle)
          return `<line x1="${center}" y1="${center}" x2="${endX}" y2="${endY}" class="web-line" />`
        }).join('')}
        
        <!-- Data polygon -->
        <polygon 
          points="${polygonPoints}" 
          fill="${color}" 
          fill-opacity="0.3" 
          stroke="${color}" 
          stroke-width="2"
        />
        
        <!-- Data points -->
        ${points.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="5" fill="${color}">
            <title>${p.label}: ${p.value} contributions</title>
          </circle>
        `).join('')}
        
        <!-- Labels -->
        ${points.map((p, i) => {
          const angle = (i * 2 * Math.PI / 7) - Math.PI / 2
          const labelR = radius + 30
          const labelX = center + labelR * Math.cos(angle)
          const labelY = center + labelR * Math.sin(angle)
          return `<text x="${labelX}" y="${labelY}" text-anchor="middle" class="day-label">${p.label}</text>`
        }).join('')}
      </g>
    </svg>
  `
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
  
  const totalContributions = days.reduce((sum, day) => sum + day.count, 0)
  const maxStreak = calculateMaxStreak(days)
  
  const colors = [
    '#161b22',
    adjustColorOpacity(color, 0.3),
    adjustColorOpacity(color, 0.5),
    adjustColorOpacity(color, 0.7),
    color
  ]

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

  if (theme !== 'minimal') {
    svg += `<text x="15" y="25" class="title">GitHub Contributions</text>`
  }

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
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
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

    const color = searchParams.get('color') || '6366F1'
    const bgColor = searchParams.get('bg') || '0D1117'
    const showStats = searchParams.get('stats') !== 'false'
    const theme = (searchParams.get('theme') || 'default') as 'default' | 'compact' | 'minimal'
    const chartType = (searchParams.get('chart') || 'heatmap') as 'heatmap' | 'line' | 'bar' | 'radar'
    
    const contributions = await fetchGitHubContributions(username)
    
    let svg: string
    
    switch (chartType) {
      case 'line':
        svg = generateLineChart(contributions, `#${color}`, `#${bgColor}`, username)
        break
      case 'bar':
        svg = generateBarChart(contributions, `#${color}`, `#${bgColor}`, username)
        break
      case 'radar':
        svg = generateRadarChart(contributions, `#${color}`, `#${bgColor}`, username)
        break
      case 'heatmap':
      default:
        svg = generateHeatmapSVG(contributions, {
          color: `#${color}`,
          bgColor: `#${bgColor}`,
          showStats,
          theme
        })
    }

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