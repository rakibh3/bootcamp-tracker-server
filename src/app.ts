import cors from 'cors'
import express, {Application, Request, Response} from 'express'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import compression from 'compression'
import helmet from 'helmet'

import {globalErrorHandler} from '@/error/globalErrorHandler'
import {notFoundRoute} from '@/error/notFoundRoute'
import {globalLimiter} from '@/middlewares/rateLimiter'

import router from './routes'

// Extend Day.js with timezone support
dayjs.extend(utc)
dayjs.extend(timezone)

// Create Express app
const app: Application = express()

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for HTML responses
  }),
)

// Compression middleware for response size reduction
app.use(
  compression({
    level: 6, // Balance between speed and compression
    threshold: 1024, // Only compress responses > 1KB
  }),
)

// Parser with size limits
app.use(express.json({limit: '10kb'}))
app.use(express.urlencoded({extended: true, limit: '10kb'}))

// CORS
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:4173',
    ],
    credentials: true,
  }),
)

// Global rate limiter
// app.use('/api', globalLimiter)

// Root endpoint with beautified HTML
const getRootController = (req: Request, res: Response) => {
  const now = dayjs()
  const dateStr = now.format('YYYY-MM-DD')
  const timeStr = now.format('hh:mm:ss A')

  const html = ` <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EduPulse API 📊</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                min-height: 100vh;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #2563eb;
                text-align: center;
                margin-bottom: 30px;
            }
            .status {
                background: #bbf7d0;
                color: #14532d;
                padding: 10px 20px;
                border-radius: 50px;
                display: inline-block;
                margin-bottom: 20px;
            }
            .routes {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .route {
                display: flex;
                justify-content: space-between;
                padding: 10px;
                border-bottom: 1px solid #dee2e6;
            }
            .route:last-child {
                border-bottom: none;
            }
            .badge {
                background: #2563eb;
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 0.9em;
            }
            .open {
                background: #065f46;
                color: #a7f3d0;
            }
            .closed {
                background: #7f1d1d;
                color: #fecaca;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }
            th, td {
                padding: 10px;
                border-bottom: 1px solid #e5e7eb;
                text-align: left;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #6c757d;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📊 EduPulse API</h1>
            
            <div style="text-align: center;">
                <div class="status">🚀 Server running · BD Time: ${dateStr} ${timeStr}</div>
            </div>

           

            <div class="routes">
                <h2>📚 Available Routes</h2>
                <div class="route">
                    <span>Admin · Zones</span>
                    <span class="badge">/api/v1/admin/zones</span>
                </div>
                <div class="route">
                    <span>Student · Submit Attendance</span>
                    <span class="badge">/api/v1/student/submit</span>
                </div>
                <div class="route">
                    <span>Project · Progress Today</span>
                    <span class="badge">/api/v1/progress/today</span>
                </div>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #856404; margin: 0;">📖 Documentation</h3>
                <p style="margin: 10px 0 0 0;">Coming soon...</p>
            </div>

            <div class="footer">
                <p>Version 1.0.0</p>
                <p>Maintained by EduPulse Dev Team</p>
                <p>Last Updated: ${new Date().toLocaleString()}</p>
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
