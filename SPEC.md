# Mission Control - Specification

## Overview
A Next.js dashboard for monitoring and managing the AI agent organization. Real-time visibility into what Zora (Chief of Staff) and all sub-agents (Grabber, Loki, Cody, Zoe) are doing.

## Core Features

### 1. Agent Status Dashboard
- **Live status cards** for each agent:
  - Zora (Chief of Staff) - always shows "online"
  - Grabber (Lead Acquisition)
  - Loki (Graphic Design)
  - Cody (Development)
  - Zoe (Customer Experience)
- **Status states:** Active (working on task), Idle, Offline
- **Current task** being worked on (if any)
- **Last activity** timestamp

### 2. Communication Feed
- **Real-time feed** of inter-agent messages
- Show: timestamp, from agent, to agent, message content
- Filter by agent
- Search messages
- Auto-scroll with pause on hover

### 3. Task Board (Kanban-style)
- **Columns:** Backlog, In Progress, Review, Done
- **Task cards** with:
  - Title
  - Description
  - Assigned to (Preston, Zora, or sub-agent)
  - Status
  - Priority (Low, Medium, High, Urgent)
  - Due date (optional)
  - Created date
  - Updated date
- **Drag and drop** between columns
- **Create/edit/delete** tasks
- **Filter** by assignee, priority, status

### 4. Calendar
- **Monthly/weekly/daily** views
- Shows:
  - Scheduled tasks
  - Cron jobs
  - Reminders
  - Deadlines
- **Create events** with:
  - Title
  - Description
  - Start/end time
  - Recurrence (for cron jobs)
  - Assigned agent

### 5. Agent Detail Pages
- Click on agent card to see:
  - Full activity history
  - Tasks assigned
  - Performance metrics (tasks completed, avg time, etc.)

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** SQLite (via Prisma or Drizzle)
- **Real-time:** Server-Sent Events or polling
- **State:** React Query or SWR

## Database Schema

### agents
- id (primary key)
- name (Zora, Grabber, Loki, Cody, Zoe)
- role
- emoji
- status (active, idle, offline)
- current_task_id (nullable, FK to tasks)
- last_activity_at

### tasks
- id (primary key)
- title
- description
- status (backlog, in_progress, review, done)
- priority (low, medium, high, urgent)
- assigned_to (agent id or "preston" or "matt")
- due_date (nullable)
- created_at
- updated_at

### messages
- id (primary key)
- from_agent (agent id or "system")
- to_agent (agent id or "all")
- content
- created_at

### events
- id (primary key)
- title
- description
- start_time
- end_time
- recurrence (nullable, cron expression)
- assigned_agent (nullable)
- created_at

## API Routes

### Agents
- GET /api/agents - list all agents with status
- GET /api/agents/:id - get agent details
- PATCH /api/agents/:id - update agent status

### Tasks
- GET /api/tasks - list tasks (with filters)
- POST /api/tasks - create task
- PATCH /api/tasks/:id - update task
- DELETE /api/tasks/:id - delete task

### Messages
- GET /api/messages - list messages (with filters, pagination)
- POST /api/messages - create message (for logging)

### Events
- GET /api/events - list events (with date range)
- POST /api/events - create event
- PATCH /api/events/:id - update event
- DELETE /api/events/:id - delete event

## UI Layout
```
+------------------------------------------+
|  Mission Control             [Preston]   |
+------------------------------------------+
|        |                                 |
| Agents |  Main Content Area              |
| -----  |  (Dashboard / Tasks / Calendar) |
| Zora   |                                 |
| Grabber|                                 |
| Loki   |                                 |
| Cody   |                                 |
| Zoe    |                                 |
|        |                                 |
+--------+---------------------------------+
|        Communication Feed               |
+------------------------------------------+
```

## Design Notes
- Dark mode by default
- Clean, minimal, professional
- Mobile responsive
- Fast and snappy

## MVP Scope
Build this in order:
1. Project setup (Next.js, Tailwind, shadcn, SQLite)
2. Database schema and seed data
3. Agent status dashboard
4. Task board with CRUD
5. Communication feed
6. Calendar view

## File Structure
```
mission-control/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (dashboard)
│   ├── tasks/page.tsx
│   ├── calendar/page.tsx
│   └── api/
│       ├── agents/route.ts
│       ├── tasks/route.ts
│       ├── messages/route.ts
│       └── events/route.ts
├── components/
│   ├── AgentCard.tsx
│   ├── TaskBoard.tsx
│   ├── TaskCard.tsx
│   ├── MessageFeed.tsx
│   ├── Calendar.tsx
│   └── ui/ (shadcn components)
├── lib/
│   ├── db.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
└── ...
```

## Notes for Cody
- Use `bunx create-next-app` with TypeScript and Tailwind
- Install shadcn/ui components as needed
- Keep it simple — we can iterate
- Commit frequently
- Test that it runs before finishing
