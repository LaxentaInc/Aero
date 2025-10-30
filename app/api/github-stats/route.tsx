// app/api/github-stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface GitHubStats {
  totalStars: number
  totalCommits: number
  totalPRs: number
  totalIssues: number
  contributedTo: number
  currentStreak: number
  longestStreak: number
  streakDates: { start: string; end: string }
  languages: { name: string; percentage: number; color: string }[]
}

// Language colors from GitHub
const LANGUAGE_COLORS: { [key: string]: string } = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  Vue: '#41b883',
  React: '#61dafb',
}

async function fetchGitHubStats(token: string): Promise<GitHubStats> {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  // Fetch user data and contributions
  const userQuery = `
    query {
      viewer {
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          totalRepositoryContributions
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
        repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC) {
          nodes {
            stargazerCount
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
          }
        }
        repositoriesContributedTo(first: 100, contributionTypes: [COMMIT, PULL_REQUEST, ISSUE]) {
          totalCount
        }
      }
    }
  `

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: userQuery }),
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()

  if (data.errors) {
    throw new Error(data.errors[0].message)
  }

  const viewer = data.data.viewer
  const contributions = viewer.contributionsCollection

  // Calculate total stars
  const totalStars = viewer.repositories.nodes.reduce(
    (sum: number, repo: any) => sum + repo.stargazerCount,
    0
  )

  // Calculate language stats
  const languageStats: { [key: string]: number } = {}
  viewer.repositories.nodes.forEach((repo: any) => {
    repo.languages.edges.forEach((edge: any) => {
      const lang = edge.node.name
      languageStats[lang] = (languageStats[lang] || 0) + edge.size
    })
  })

  const totalSize = Object.values(languageStats).reduce((a: any, b: any) => a + b, 0)
  const languages = Object.entries(languageStats)
    .map(([name, size]) => ({
      name,
      percentage: ((size / totalSize) * 100),
      color: LANGUAGE_COLORS[name] || '#858585',
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4)

  // Calculate streaks
  const weeks = contributions.contributionCalendar.weeks
  const days: { date: string; count: number }[] = []
  weeks.forEach((week: any) => {
    week.contributionDays.forEach((day: any) => {
      days.push({ date: day.date, count: day.contributionCount })
    })
  })

  const { currentStreak, longestStreak, streakDates } = calculateStreaks(days)

  return {
    totalStars,
    totalCommits: contributions.totalCommitContributions,
    totalPRs: contributions.totalPullRequestContributions,
    totalIssues: contributions.totalIssueContributions,
    contributedTo: viewer.repositoriesContributedTo.totalCount,
    currentStreak,
    longestStreak,
    streakDates,
    languages,
  }
}

function calculateStreaks(days: { date: string; count: number }[]) {
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let streakStart = ''
  let streakEnd = ''
  let longestStart = ''
  let longestEnd = ''

  // Calculate from most recent day
  const reversedDays = [...days].reverse()
  let isCurrentStreak = true

  for (let i = 0; i < reversedDays.length; i++) {
    const day = reversedDays[i]
    
    if (day.count > 0) {
      tempStreak++
      if (isCurrentStreak) {
        currentStreak = tempStreak
        if (!streakEnd) streakEnd = day.date
        streakStart = day.date
      }
      
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
        longestEnd = longestEnd || day.date
        longestStart = day.date
      }
    } else {
      if (isCurrentStreak && tempStreak > 0) {
        isCurrentStreak = false
      }
      
      if (!isCurrentStreak && tempStreak > 0) {
        tempStreak = 0
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    streakDates: { start: streakStart, end: streakEnd },
  }
}

function generateStatsCard(stats: GitHubStats, username: string, theme: 'dark' | 'light' = 'dark'): string {
  const isDark = theme === 'dark'
  const bgColor = isDark ? '#0d1117' : '#ffffff'
  const textColor = isDark ? '#c9d1d9' : '#24292f'
  const secondaryColor = isDark ? '#8b949e' : '#57606a'
  const borderColor = isDark ? '#30363d' : '#d0d7de'
  const accentColor = '#58a6ff'

  const width = 700
  const height = 400

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .stat-title { 
            font: 600 16px 'Segoe UI', sans-serif; 
            fill: ${textColor};
          }
          .stat-value { 
            font: 700 28px 'Segoe UI', sans-serif; 
            fill: ${accentColor};
          }
          .stat-label { 
            font: 400 11px 'Segoe UI', sans-serif; 
            fill: ${secondaryColor};
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .section-title {
            font: 600 14px 'Segoe UI', sans-serif;
            fill: ${textColor};
          }
          .lang-name {
            font: 500 12px 'Segoe UI', sans-serif;
            fill: ${textColor};
          }
          .lang-percent {
            font: 400 11px 'Segoe UI', sans-serif;
            fill: ${secondaryColor};
          }
          .circle-bg {
            fill: none;
            stroke: ${borderColor};
            stroke-width: 8;
          }
          .circle-progress {
            fill: none;
            stroke-width: 8;
            stroke-linecap: round;
            transform-origin: center;
            transform: rotate(-90deg);
          }
          .streak-circle {
            stroke: ${accentColor};
            stroke-dasharray: 251.2;
            stroke-dashoffset: 251.2;
            animation: fillCircle 2s ease-out forwards;
          }
          .lang-bar {
            animation: fillBar 1.5s ease-out forwards;
            transform-origin: left;
          }
          .fade-in {
            animation: fadeIn 0.8s ease-out forwards;
            opacity: 0;
          }
          @keyframes fillCircle {
            to { stroke-dashoffset: 0; }
          }
          @keyframes fillBar {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
      </defs>
      
      <rect width="${width}" height="${height}" fill="${bgColor}" rx="10" stroke="${borderColor}" stroke-width="1"/>
      
      <!-- Header -->
      <text x="30" y="35" class="stat-title fade-in">${username}'s GitHub Stats</text>
      
      <!-- Stats Grid -->
      <g class="fade-in" style="animation-delay: 0.1s">
        <!-- Total Stars -->
        <text x="30" y="75" class="stat-label">Total Stars Earned</text>
        <text x="30" y="105" class="stat-value">${stats.totalStars}</text>
      </g>
      
      <g class="fade-in" style="animation-delay: 0.2s">
        <!-- Total Commits -->
        <text x="180" y="75" class="stat-label">Total Commits (last year)</text>
        <text x="180" y="105" class="stat-value">${stats.totalCommits}</text>
      </g>
      
      <g class="fade-in" style="animation-delay: 0.3s">
        <!-- Total PRs -->
        <text x="30" y="145" class="stat-label">Total PRs</text>
        <text x="30" y="175" class="stat-value">${stats.totalPRs}</text>
      </g>
      
      <g class="fade-in" style="animation-delay: 0.4s">
        <!-- Total Issues -->
        <text x="180" y="145" class="stat-label">Total Issues</text>
        <text x="180" y="175" class="stat-value">${stats.totalIssues}</text>
      </g>
      
      <g class="fade-in" style="animation-delay: 0.5s">
        <!-- Contributed To -->
        <text x="330" y="75" class="stat-label">Contributed To (last year)</text>
        <text x="330" y="105" class="stat-value">${stats.contributedTo}</text>
      </g>
      
      <!-- Streak Circles -->
      <g transform="translate(520, 60)">
        <!-- Current Streak -->
        <circle cx="40" cy="40" r="40" class="circle-bg"/>
        <circle cx="40" cy="40" r="40" class="circle-progress streak-circle" style="animation-delay: 0.6s"/>
        <text x="40" y="35" text-anchor="middle" class="stat-value fade-in" style="font-size: 24px; animation-delay: 0.8s">${stats.currentStreak}</text>
        <text x="40" y="55" text-anchor="middle" class="stat-label fade-in" style="animation-delay: 0.8s">Current Streak</text>
        <text x="40" y="100" text-anchor="middle" class="lang-percent fade-in" style="animation-delay: 0.9s">${formatDateRange(stats.streakDates.start, stats.streakDates.end)}</text>
      </g>
      
      <g transform="translate(640, 60)">
        <!-- Longest Streak -->
        <circle cx="40" cy="40" r="40" class="circle-bg"/>
        <circle cx="40" cy="40" r="40" class="circle-progress streak-circle" style="animation-delay: 0.7s"/>
        <text x="40" y="35" text-anchor="middle" class="stat-value fade-in" style="font-size: 24px; animation-delay: 0.9s">${stats.longestStreak}</text>
        <text x="40" y="55" text-anchor="middle" class="stat-label fade-in" style="animation-delay: 0.9s">Longest Streak</text>
      </g>
      
      <!-- Most Used Languages -->
      <text x="30" y="230" class="section-title fade-in" style="animation-delay: 1s">Most Used Languages</text>
      
      <!-- Language Bar -->
      <g transform="translate(30, 250)">
        ${stats.languages.map((lang, i) => {
          const xOffset = i === 0 ? 0 : stats.languages.slice(0, i).reduce((sum, l) => sum + (l.percentage / 100) * 640, 0)
          const barWidth = (lang.percentage / 100) * 640
          return `
            <rect 
              x="${xOffset}" 
              y="0" 
              width="${barWidth}" 
              height="8" 
              fill="${lang.color}" 
              rx="4"
              class="lang-bar"
              style="animation-delay: ${1.1 + i * 0.1}s"
            />
          `
        }).join('')}
      </g>
      
      <!-- Language Labels -->
      ${stats.languages.map((lang, i) => `
        <g class="fade-in" style="animation-delay: ${1.5 + i * 0.1}s">
          <circle cx="${45 + i * 160}" cy="285" r="5" fill="${lang.color}"/>
          <text x="${55 + i * 160}" y="289" class="lang-name">${lang.name} ${lang.percentage.toFixed(1)}%</text>
        </g>
      `).join('')}
    </svg>
  `
}

function formatDateRange(start: string, end: string): string {
  if (!start || !end) return ''
  const startDate = new Date(start)
  const endDate = new Date(end)
  const format = (d: Date) => `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  return `${format(startDate)} - ${format(endDate)}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cookieStore = await cookies() // Add this line
    
    // Update these lines to check cookies
    const token = searchParams.get('token') || 
                  cookieStore.get('github_token')?.value || 
                  process.env.GITHUB_TOKEN
    
    const username = searchParams.get('user') || 
                     cookieStore.get('github_username')?.value
    
    const theme = (searchParams.get('theme') || 'dark') as 'dark' | 'light'
    
    if (!username) {
      return new NextResponse('Missing username parameter', { status: 400 })
    }

    if (!token) {
      return new NextResponse('GitHub token required. Pass ?token=YOUR_TOKEN or set GITHUB_TOKEN env var', { status: 401 })
    }

    const stats = await fetchGitHubStats(token)
    const svg = generateStatsCard(stats, username, theme)

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600',
      },
    })

  } catch (error: any) {
    console.error('[GITHUB-STATS] Error:', error)
    const errorSvg = `
      <svg width="700" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="700" height="100" fill="#0D1117" rx="10"/>
        <text x="350" y="50" text-anchor="middle" font-family="Segoe UI" font-size="14" fill="#f85149">
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