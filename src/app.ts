import compression from 'compression'
import cors from 'cors'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import express, {Application, Request, Response} from 'express'
import helmet from 'helmet'

import {globalErrorHandler, notFoundRoute} from '@/error'
import {globalLimiter, morganMiddleware} from '@/middlewares'

import router from './routes'

// Extend Day.js with timezone support
dayjs.extend(utc)
dayjs.extend(timezone)

// Create Express app
const app: Application = express()

// Parser with size limits
app.use(express.json({limit: '10kb'}))
app.use(express.urlencoded({extended: true, limit: '10kb'}))

// Trust proxy for rate limiting accuracy (Cloudflare, Heroku, Vercel, etc)
app.set('trust proxy', 1)

// CORS
const allowedOrigins = [
  'https://catchasync.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
]

app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) {
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// HTTP Request logging
app.use(morganMiddleware)

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for HTML responses
    crossOriginResourcePolicy: {policy: 'cross-origin'},
  }),
)

// Compression middleware for response size reduction
app.use(
  compression({
    level: 6, // Balance between speed and compression
    threshold: 1024, // Only compress responses > 1KB
  }),
)

// Global rate limiter
app.use('/api', globalLimiter)

// Root endpoint with beautified HTML
const getRootController = (req: Request, res: Response) => {
  const now = dayjs()
  const dateStr = now.format('YYYY-MM-DD')
  const timeStr = now.format('hh:mm:ss A')

  const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CatchAsync API</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                line-height: 1.6;
                background: #0a0f0d;
                color: #e0e0e0;
                min-height: 100vh;
                padding: 20px;
            }
            .container {
                max-width: 720px;
                margin: 0 auto;
                background: #141c18;
                border: 1px solid #1e2e25;
                border-radius: 16px;
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #0d1f15 0%, #132a1c 100%);
                padding: 32px 30px;
                text-align: center;
                border-bottom: 1px solid #1e2e25;
            }
            .header h1 { color: #13ec6a; font-size: 1.6em; letter-spacing: -0.5px; }
            .header p { color: #6b8f7b; font-size: 0.85em; margin-top: 6px; }
            .status-bar {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(19,236,106,0.08);
                border: 1px solid rgba(19,236,106,0.15);
                color: #13ec6a;
                padding: 6px 16px;
                border-radius: 50px;
                font-size: 0.8em;
                font-weight: 600;
                margin-top: 16px;
            }
            .status-dot {
                width: 8px; height: 8px;
                background: #13ec6a;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
            .content { padding: 24px 30px; }
            .section { margin-bottom: 20px; }
            .section-title {
                font-size: 0.7em;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: #5a7a68;
                margin-bottom: 10px;
            }
            .route-list { display: flex; flex-direction: column; gap: 6px; }
            .route {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 14px;
                background: #0d1610;
                border: 1px solid #1a2b22;
                border-radius: 10px;
                font-size: 0.85em;
            }
            .route-label { color: #9db9a8; font-weight: 500; }
            .route-path {
                font-family: 'SF Mono', 'Fira Code', monospace;
                color: #13ec6a;
                font-size: 0.82em;
                background: rgba(19,236,106,0.06);
                padding: 3px 10px;
                border-radius: 6px;
            }
            .footer {
                text-align: center;
                padding: 16px 30px;
                border-top: 1px solid #1e2e25;
                color: #3d5a4a;
                font-size: 0.75em;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⚡ CatchAsync API</h1>
                <p>Bootcamp Tracker — Backend Service</p>
                <div class="status-bar">
                    <span class="status-dot"></span>
                    Operational · ${dateStr} ${timeStr} BDT
                </div>
            </div>
            <div class="content">
                <div class="section">
                    <div class="section-title">Auth & Users</div>
                    <div class="route-list">
                        <div class="route">
                            <span class="route-label">Request OTP</span>
                            <span class="route-path">POST /api/v1/auth/request-otp</span>
                        </div>
                        <div class="route">
                            <span class="route-label">Verify OTP</span>
                            <span class="route-path">POST /api/v1/auth/verify-otp</span>
                        </div>
                        <div class="route">
                            <span class="route-label">Register</span>
                            <span class="route-path">POST /api/v1/auth/register</span>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Students</div>
                    <div class="route-list">
                        <div class="route">
                            <span class="route-label">List / Create</span>
                            <span class="route-path">/api/v1/students</span>
                        </div>
                        <div class="route">
                            <span class="route-label">Assign SRM</span>
                            <span class="route-path">POST /api/v1/students/assign-srm</span>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Attendance</div>
                    <div class="route-list">
                        <div class="route">
                            <span class="route-label">Create</span>
                            <span class="route-path">POST /api/v1/create-attendance</span>
                        </div>
                        <div class="route">
                            <span class="route-label">Get Records</span>
                            <span class="route-path">GET /api/v1/get-attendance</span>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Tasks</div>
                    <div class="route-list">
                        <div class="route">
                            <span class="route-label">All Tasks</span>
                            <span class="route-path">GET /api/v1/task</span>
                        </div>
                        <div class="route">
                            <span class="route-label">Current / Upcoming / Due</span>
                            <span class="route-path">/api/v1/task/{current,upcoming,due}</span>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Call History & Analytics</div>
                    <div class="route-list">
                        <div class="route">
                            <span class="route-label">Call History</span>
                            <span class="route-path">GET /api/v1/call-history</span>
                        </div>
                        <div class="route">
                            <span class="route-label">Dashboard Analytics</span>
                            <span class="route-path">GET /api/v1/analytics/dashboard</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="footer">
                v1.0.0 · CatchAsync Dev Team
            </div>
        </div>
    </body>
    </html>`

  res.status(200).type('html').send(html)
}

// Route handler for /
app.get('/', getRootController)

// Use the router
app.use('/api/v1', router)

// Error Handler
app.use(globalErrorHandler)

// Not found route
app.use(notFoundRoute)

export default app
