# Bootcamp Tracker - Product Requirements Document

## Overview

Bootcamp Tracker is a comprehensive student management system designed to track bootcamp students' attendance, progress, and engagement throughout their learning journey.

## Goals

1. **Track Student Attendance**: Monitor daily attendance for bootcamp sessions
2. **Manage Student Progress**: Track module completion and mission progress
3. **Call History Management**: Log and track follow-up calls with students
4. **Analytics Dashboard**: Provide insights into student engagement and performance

## User Roles

### Super Admin
- Full system access
- Can manage all users and data
- Access to all analytics and reports

### Admin (SRM - Student Relationship Manager)
- Can manage students
- Can track attendance
- Can log call history
- Access to relevant analytics

### Student
- Can view own attendance
- Can view own progress
- Can receive notifications

## Core Features

### 1. User Management
- Registration and authentication via OTP
- Role-based access control
- Profile management

### 2. Attendance Tracking
- Daily attendance marking
- Attendance windows (configurable time slots)
- Attendance history and reports
- Absence tracking and notifications

### 3. Task Management
- Mission-based task assignments
- Task guidelines and due dates
- Current and upcoming task visibility

### 4. Call History
- Log calls with students
- Track call status (completed, no answer, busy, etc.)
- Schedule follow-up calls
- Call duration tracking

### 5. Analytics
- Dashboard with key metrics
- Attendance trends
- Student progress tracking
- Batch-wise statistics

## Technical Requirements

- Node.js with Express.js
- MongoDB for data storage
- Redis for caching and rate limiting
- JWT for authentication
- Email service for OTP delivery

## API Endpoints

See `postman_collection.json` for complete API documentation.
