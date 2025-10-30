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
  rank: { level: string; score: number; color: string }
}

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

// Rate limiting with Upstash Redis
async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number }> {
  const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
  const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
  
  if (!REDIS_URL || !REDIS_TOKEN) {
    // Fallback: allow if Redis not configured
    return { allowed: true, remaining: 10 }
  }

  const key = `ratelimit:github-stats:${identifier}`
  const limit = 10 // 10 requests
  const window = 60 // per 60 seconds

  try {
    // Increment counter
    const incr = await fetch(`${REDIS_URL}/incr/${key}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    }).then(r => r.json())

    const count = incr.result

    // Set expiry on first request
    if (count === 1) {
      await fetch(`${REDIS_URL}/expire/${key}/${window}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      })
    }

    const remaining = Math.max(0, limit - count)
    return {
      allowed: count <= limit,
      remaining,
    }
  } catch (error) {
    console.error('[RATE-LIMIT] Redis error:', error)
    return { allowed: true, remaining: 10 }
  }
}

// Validate username to prevent injection
function validateUsername(username: string): boolean {
  // GitHub usernames can only contain alphanumeric characters and hyphens
  // Cannot start or end with hyphen, max 39 chars
  const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/
  return usernameRegex.test(username)
}

// Check if user is authenticated and requesting their own stats
async function getAuthenticatedUser(token: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.login
  } catch {
    return null
  }
}

function calculateRank(stats: Omit<GitHubStats, 'rank'>): { level: string; score: number; color: string } {
  const score = 
    (stats.totalStars * 5) +
    (stats.totalCommits * 2) +
    (stats.totalPRs * 10) +
    (stats.totalIssues * 5) +
    (stats.contributedTo * 8) +
    (stats.currentStreak * 3) +
    (stats.longestStreak * 2)

  if (score >= 10000) return { level: 'S+', score, color: '#FF6B9D' }
  if (score >= 7500) return { level: 'S', score, color: '#C45AFF' }
  if (score >= 5000) return { level: 'A++', score, color: '#5AABFF' }
  if (score >= 3500) return { level: 'A+', score, color: '#5AC8FF' }
  if (score >= 2000) return { level: 'A', score, color: '#5AFFED' }
  if (score >= 1000) return { level: 'B++', score, color: '#5AFFC4' }
  if (score >= 500) return { level: 'B+', score, color: '#A3FF5A' }
  if (score >= 250) return { level: 'B', score, color: '#FFED5A' }
  if (score >= 100) return { level: 'C', score, color: '#FFB85A' }
  return { level: 'D', score, color: '#FF5A5A' }
}

async function fetchGitHubStats(token: string, username: string, includePrivate: boolean): Promise<GitHubStats> {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  let query: string
  let variables: any = {}

  if (includePrivate) {
    // Use viewer query for authenticated user to include private repos
    query = `
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
          repositories(first: 100, ownerAffiliations: OWNER) {
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
  } else {
    // Query specific user with public repos only
    query = `
      query($username: String!) {
        user(login: $username) {
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
    variables = { username }
  }

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()

  if (data.errors) {
    throw new Error(data.errors[0].message)
  }

  const user = includePrivate ? data.data.viewer : data.data.user
  
  if (!user) {
    throw new Error(`User "${username}" not found`)
  }

  const contributions = user.contributionsCollection

  const totalStars = user.repositories.nodes.reduce(
    (sum: number, repo: any) => sum + repo.stargazerCount,
    0
  )

  const languageStats: { [key: string]: number } = {}
  user.repositories.nodes.forEach((repo: any) => {
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
    .slice(0, 5)

  const weeks = contributions.contributionCalendar.weeks
  const days: { date: string; count: number }[] = []
  weeks.forEach((week: any) => {
    week.contributionDays.forEach((day: any) => {
      days.push({ date: day.date, count: day.contributionCount })
    })
  })

  const { currentStreak, longestStreak, streakDates } = calculateStreaks(days)

  const statsWithoutRank = {
    totalStars,
    totalCommits: contributions.totalCommitContributions,
    totalPRs: contributions.totalPullRequestContributions,
    totalIssues: contributions.totalIssueContributions,
    contributedTo: user.repositoriesContributedTo.totalCount,
    currentStreak,
    longestStreak,
    streakDates,
    languages,
  }

  const rank = calculateRank(statsWithoutRank)

  return {
    ...statsWithoutRank,
    rank,
  }
}

function calculateStreaks(days: { date: string; count: number }[]) {
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let streakStart = ''
  let streakEnd = ''

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

function generateStatsCard(stats: GitHubStats, username: string, theme: 'dark' | 'light' = 'dark', isPrivate: boolean = false): string {
  const isDark = theme === 'dark'
  const bgColor = isDark ? '#0d1117' : '#ffffff'
  const textColor = isDark ? '#c9d1d9' : '#24292f'
  const secondaryColor = isDark ? '#8b949e' : '#57606a'
  const borderColor = isDark ? '#30363d' : '#d0d7de'
  const cardBg = isDark ? '#161b22' : '#f6f8fa'

  const width = 1000
  const height = 480

  const maxStreak = Math.max(stats.currentStreak, stats.longestStreak, 1)
  const currentProgress = (stats.currentStreak / maxStreak) * 251.2
  const longestProgress = (stats.longestStreak / maxStreak) * 251.2

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rankGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${stats.rank.color};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${stats.rank.color};stop-opacity:0" />
        </linearGradient>
        
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <style>
          .stat-title { 
            font: 600 16px 'Segoe UI', sans-serif; 
            fill: ${textColor};
          }
          .stat-value { 
            font: 700 28px 'Segoe UI', sans-serif; 
            fill: ${textColor};
          }
          .stat-label { 
            font: 500 11px 'Segoe UI', sans-serif; 
            fill: ${secondaryColor};
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .rank-text {
            font: 900 56px 'Segoe UI', sans-serif;
            fill: ${stats.rank.color};
            filter: url(#glow);
          }
          .rank-label {
            font: 600 12px 'Segoe UI', sans-serif;
            fill: ${secondaryColor};
            text-transform: uppercase;
          }
          .score-text {
            font: 600 14px 'Segoe UI', sans-serif;
            fill: ${textColor};
          }
          .lang-name {
            font: 500 13px 'Segoe UI', sans-serif;
            fill: ${textColor};
          }
          .lang-percent {
            font: 600 12px 'Segoe UI', sans-serif;
            fill: ${secondaryColor};
          }
          .badge-private {
            font: 600 9px 'Segoe UI', sans-serif;
            fill: #58a6ff;
          }
          .circle-bg {
            fill: none;
            stroke: ${borderColor};
            stroke-width: 5;
          }
          .circle-progress {
            fill: none;
            stroke-width: 5;
            stroke-linecap: round;
            transform-origin: center;
            transform: rotate(-90deg);
          }
          .current-circle {
            stroke: #58a6ff;
            stroke-dasharray: 251.2;
            stroke-dashoffset: ${251.2 - currentProgress};
            filter: drop-shadow(0 0 6px #58a6ff);
          }
          .longest-circle {
            stroke: #bc8cff;
            stroke-dasharray: 251.2;
            stroke-dashoffset: ${251.2 - longestProgress};
            filter: drop-shadow(0 0 6px #bc8cff);
          }
          .lang-bar {
            rx: 3;
            animation: fillBar 1.2s ease-out forwards;
            transform-origin: left;
          }
          .fade-in {
            animation: fadeIn 0.6s ease-out forwards;
            opacity: 0;
          }
          @keyframes fillBar {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
      </defs>
      
      <rect width="${width}" height="${height}" fill="${bgColor}" rx="12"/>
      
      <!-- Rank Badge -->
      <g transform="translate(20, 20)">
        <rect x="0" y="0" width="140" height="160" fill="url(#rankGlow)" rx="10"/>
        <rect x="0" y="0" width="140" height="160" fill="${cardBg}" rx="10" opacity="0.9"/>
        <text x="70" y="75" text-anchor="middle" class="rank-text fade-in">${stats.rank.level}</text>
        <text x="70" y="100" text-anchor="middle" class="rank-label fade-in">RANK</text>
        <text x="70" y="125" text-anchor="middle" class="score-text fade-in">${stats.rank.score.toLocaleString()}</text>
        <text x="70" y="145" text-anchor="middle" class="stat-label fade-in">POINTS</text>
      </g>

      <!-- Header -->
      <text x="180" y="45" class="stat-title fade-in">${username}'s GitHub Stats</text>
      ${isPrivate ? `<text x="180" y="65" class="badge-private fade-in">🔒 Including Private Repos</text>` : ''}
      
      <!-- Stats Grid -->
      <g transform="translate(180, 80)">
        <g class="fade-in" style="animation-delay: 0.1s">
          <text x="0" y="0" class="stat-label">⭐ STARS</text>
          <text x="0" y="26" class="stat-value">${stats.totalStars.toLocaleString()}</text>
        </g>
        
        <g class="fade-in" style="animation-delay: 0.15s">
          <text x="160" y="0" class="stat-label">💻 COMMITS</text>
          <text x="160" y="26" class="stat-value">${stats.totalCommits.toLocaleString()}</text>
        </g>
        
        <g class="fade-in" style="animation-delay: 0.2s">
          <text x="320" y="0" class="stat-label">🔀 PRs</text>
          <text x="320" y="26" class="stat-value">${stats.totalPRs.toLocaleString()}</text>
        </g>

        <g class="fade-in" style="animation-delay: 0.25s">
          <text x="0" y="60" class="stat-label">🐛 ISSUES</text>
          <text x="0" y="86" class="stat-value">${stats.totalIssues.toLocaleString()}</text>
        </g>
        
        <g class="fade-in" style="animation-delay: 0.3s">
          <text x="160" y="60" class="stat-label">🤝 CONTRIBUTED</text>
          <text x="160" y="86" class="stat-value">${stats.contributedTo.toLocaleString()}</text>
        </g>
      </g>
      
      <!-- Streak Circles - COMPLETELY SEPARATE, NO NESTING -->
      <!-- Current Streak Circle -->
      <g class="fade-in" style="animation-delay: 0.35s">
        <circle cx="920" cy="95" r="38" class="circle-bg"/>
        <circle cx="920" cy="95" r="38" class="circle-progress current-circle"/>
        <text x="920" y="92" text-anchor="middle" class="stat-value" style="font-size: 24px">${stats.currentStreak}</text>
        <text x="920" y="108" text-anchor="middle" class="stat-label" style="font-size: 9px">CURRENT</text>
      </g>
      
      <!-- Longest Streak Circle - DIFFERENT Y POSITION -->
      <g class="fade-in" style="animation-delay: 0.4s">
        <circle cx="920" cy="205" r="38" class="circle-bg"/>
        <circle cx="920" cy="205" r="38" class="circle-progress longest-circle"/>
        <text x="920" y="202" text-anchor="middle" class="stat-value" style="font-size: 24px">${stats.longestStreak}</text>
        <text x="920" y="218" text-anchor="middle" class="stat-label" style="font-size: 9px">LONGEST</text>
      </g>
      
      <!-- Languages Section -->
      <g transform="translate(20, 260)">
        <text x="0" y="0" class="stat-title fade-in" style="animation-delay: 0.45s">🌐 Top Languages</text>
        
        <g transform="translate(0, 20)">
          ${stats.languages.map((lang, i) => {
            const yPos = i * 32
            return `
              <g class="fade-in" style="animation-delay: ${0.5 + i * 0.08}s">
                <text x="0" y="${yPos + 12}" class="lang-name">${lang.name}</text>
                <text x="960" y="${yPos + 12}" text-anchor="end" class="lang-percent">${lang.percentage.toFixed(1)}%</text>
                <rect x="0" y="${yPos + 18}" width="960" height="6" fill="${borderColor}" rx="3"/>
                <rect 
                  x="0" 
                  y="${yPos + 18}" 
                  width="${(lang.percentage / 100) * 960}" 
                  height="6" 
                  fill="${lang.color}"
                  class="lang-bar"
                  style="animation-delay: ${0.6 + i * 0.08}s; filter: drop-shadow(0 0 3px ${lang.color})"
                />
              </g>
            `
          }).join('')}
        </g>
      </g>
    </svg>
  `
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cookieStore = await cookies()
    
    const username = searchParams.get('user') || 
                     cookieStore.get('github_username')?.value
    
    const theme = (searchParams.get('theme') || 'dark') as 'dark' | 'light'
    
    // Validate username
    if (!username) {
      return new NextResponse('Missing username parameter. Add ?user=USERNAME to URL', { status: 400 })
    }

    if (!validateUsername(username)) {
      return new NextResponse('Invalid username format', { status: 400 })
    }

    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    const identifier = `${ip}:${username}`

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(identifier)
    
    if (!allowed) {
      const rateLimitSvg = `
        <svg width="1000" height="100" xmlns="http://www.w3.org/2000/svg">
          <rect width="1000" height="100" fill="#0D1117" rx="12"/>
          <text x="500" y="55" text-anchor="middle" font-family="Segoe UI" font-size="16" fill="#f85149">
            ⏱️ Rate limit exceeded. Please wait a minute before trying again.
          </text>
        </svg>
      `
      return new NextResponse(rateLimitSvg, {
        status: 429,
        headers: {
          'Content-Type': 'image/svg+xml',
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60',
        },
      })
    }

    const token = searchParams.get('token') || 
                  cookieStore.get('github_token')?.value || 
                  process.env.GITHUB_TOKEN

    if (!token) {
      return new NextResponse('GitHub token required', { status: 401 })
    }

    // Check if user is authenticated and requesting their own stats
    const authenticatedUser = await getAuthenticatedUser(token)
    const isOwnProfile = !!(authenticatedUser && authenticatedUser.toLowerCase() === username.toLowerCase())

    // Fetch stats (include private repos if it's the user's own profile)
    const stats = await fetchGitHubStats(token, username, isOwnProfile)
    const svg = generateStatsCard(stats, username, theme, isOwnProfile)

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600',
        'X-RateLimit-Remaining': remaining.toString(),
      },
    })

  } catch (error: any) {
    console.error('[GITHUB-STATS] Error:', error)
    const errorSvg = `
      <svg width="1000" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="1000" height="100" fill="#0D1117" rx="12"/>
        <text x="500" y="55" text-anchor="middle" font-family="Segoe UI" font-size="16" fill="#f85149">
          ❌ Error: ${error.message || 'Failed to fetch GitHub data'}
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