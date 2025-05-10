# Uptime Monitor Backend

A Scalable backend service for monitoring website availability and alerting users when their websites go down.

## Overview

This service allows users to register websites for monitoring at specified intervals. When a website becomes unavailable, the system automatically sends email notifications to the user. The application provides a complete REST API for user management and monitor configuration.

## Features

- **User Authentication**: Register, login, refresh tokens, and logout
- **Website Monitoring**: Create, view, and delete website monitors
- **Real-time Monitoring**: Scheduled pinging of websites at user-defined intervals
- **Status Tracking**: Record and track website availability over time
- **Email Notifications**: Automatic alerts when a monitored website goes down

## Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based (access and refresh tokens)
- **Messaging**: Redis Pub/Sub for event handling
- **Email**: Nodemailer for sending notifications
- **Scheduling**: Node-cron for timed monitoring

## Architecture

### Core Components

1. **Express Server** (`server.ts`)
   - Handles HTTP requests and API routes
   - Manages CORS and cookie settings
   - Entry point for the application

2. **Authentication System** (`userController.ts`, `auth.ts`, `jwt.ts`)
   - User registration and login
   - JWT token generation and validation
   - Access and refresh token management

3. **Monitor Management** (`monitorController.ts`)
   - Create, retrieve, and delete monitors
   - Associate monitors with users
   - Store monitor configurations

4. **Watcher Service** (`watcher.ts`, `pingService.ts`)
   - Runs on a schedule using node-cron
   - Checks which websites need to be pinged
   - Performs HTTP requests to monitored URLs
   - Records the results of each ping
   - Detects and publishes status changes

5. **Notification System**
   - **Publisher** (`publisher.ts`)
     - Publishes status changes to Redis
   - **Subscriber** (`subscriber.ts`, `emailService.ts`)
     - Listens for status changes on Redis
     - Sends email notifications when sites go down

### Data Flow

1. **User Journey**:
   - User creates an account and logs in
   - System issues access and refresh tokens
   - User creates monitors for their websites
   - User can view and manage their monitors

2. **Monitoring Flow**:
   - Watcher service runs every second (configurable)
   - For each monitor that needs checking:
     - System pings the website
     - Result is stored in the database
     - If status changes (up→down or down→up), an event is published

3. **Notification Flow**:
   - Subscriber listens for status change events
   - When a site goes down, email service is triggered
   - User receives notification at their configured email address

### System Design

The system follows an event-driven architecture with loose coupling between components:

- **API Layer**: Handles user interactions and CRUD operations
- **Worker Layer**: Performs the monitoring tasks independently
- **Event Layer**: Connects components through Redis pub/sub
- **Persistence Layer**: Stores all data in PostgreSQL

This architecture allows different components to scale independently and ensures the monitoring and notification processes continue even if the API experiences issues.

### Quick Start with Docker

You can quickly set up PostgreSQL and Redis using Docker:

#### PostgreSQL:
```bash
docker run --name uptime-postgres -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_USER=postgres -e POSTGRES_DB=uptime_monitor -p 5432:5432 -d postgres:latest
```

#### Redis:
```bash
docker run --name uptime-redis -p 6379:6379 -d redis:latest
```

These commands will start PostgreSQL and Redis containers with the necessary configurations for the application.

## Installation

1. Clone the repository:

```bash
git clone uptime
cd uptime
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/uptime_monitor?schema=public"
PORT=3000
FRONTEND_URL="http://localhost:3001"
NAME="your-email@gmail.com"  # For email notifications
PASS="your-email-password"   # For email notifications
ACCESS_TOKEN_SECRET="your-secret-key-for-access-tokens"
REFRESH_TOKEN_SECRET="your-secret-key-for-refresh-tokens"
```

4. Set up the database:

```bash
npx prisma migrate dev
```

5. Build the project:

```bash
npm run build
```

## Running the Application

### Development mode:

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

### Running the email worker:

```bash
node dist/service/emailworker.js
```

### Running the watcher service:

```bash
node dist/service/watcher.js
```

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/user/login` - Login and get access token
- `POST /api/refresh` - Refresh access token
- `POST /api/logout` - Logout and invalidate tokens

### User Operations
- `GET /api/users/:id` - Get user details with monitors

### Monitor Operations
- `POST /api/monitors` - Create a new monitor
- `GET /api/monitor` - Get all monitors for the user
- `GET /api/monitors/:id` - Get a specific monitor
- `DELETE /api/monitors/:id` - Delete a monitor

## Security Considerations

- Passwords are hashed using bcrypt
- HTTP-only cookies for refresh tokens
- JWT-based authentication for API access
- CORS configuration for frontend access

