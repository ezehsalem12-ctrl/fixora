# Fixora

Fixora is a backend API for a service marketplace where customers can create jobs and providers can accept, work on, review, and complete those jobs. The app uses Express.js with MongoDB and JWT-based authentication to manage user accounts, job lifecycle updates, and protected API routes.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcrypt password hashing
- dotenv for environment configuration

## Features

- User registration and login
- JWT-protected routes
- Customer and provider roles
- Job creation by customers
- Available jobs listing with pagination
- Provider job acceptance workflow
- Status transitions:
  - requested
  - accepted
  - in_progress
  - awaiting_review
  - completed
  - cancelled
- Customer review and completion flow

## Project Structure

```bash
fixora/
├── src/
│   ├── config/
│   │   └── mongoDB.js          # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js    # Register, login, get current user
│   │   └── jobController.js     # Job lifecycle logic
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT auth guard
│   │   ├── errorMiddleware.js   # Global error handler
│   │   └── pagination.js        # Pagination helper
│   ├── models/
│   │   ├── userModel.js         # User schema
│   │   └── jobModel.js          # Job schema and status enum
│   ├── routes/
│   │   ├── userRoute.js         # Auth routes
│   │   └── jobRoute.js          # Job routes
│   └── app.js                  # Express app setup
├── .gitignore
├── package.json
├── package-lock.json
├── server.js                   # App bootstrap and server startup
└── .env                        # Local environment variables (not committed)
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fixora
jwt_secret=your_super_secret_key
```

### 3. Run the app

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server starts on port `5000` by default unless you set a different `PORT` value.

## API Endpoints

### Auth Routes

```http
POST /api/user/register
POST /api/user/login
POST /api/user/logout
GET /api/user/me
```

### Job Routes

```http
POST /api/jobs/
GET /api/jobs/available-jobs
GET /api/jobs/available-jobs/:id
GET /api/jobs/available-jobs/
PATCH /api/jobs/:jobId/accept/
PATCH /api/jobs/:jobId/in-progress/
PATCH /api/jobs/:jobId/update-to-review/
PATCH /api/jobs/:jobId/completed/
PATCH /api/jobs/:jobId/cancel/
```

## Authentication

Protected routes require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

The auth middleware verifies the JWT and loads the authenticated user before allowing access to protected endpoints.

## User Roles

The app supports two roles:

- `customer`: can create jobs and complete them after provider review
- `provider`: can accept jobs, work on them, submit for review, and manage active assignments

## Job Lifecycle

A typical job lifecycle follows this flow:

1. Customer creates a job
2. Job is in `requested` state and visible to providers
3. Provider accepts the job
4. Provider updates status to `in_progress`
5. Provider submits the job for review
6. Customer marks the job as `completed`
7. Job ends as `completed` or can be `cancelled` before acceptance

## Notes

This repository is currently a backend-only service. It does not include a frontend interface, and the app expects a MongoDB instance to be running and reachable through `MONGODB_URI`.

## License

This project is currently configured with the ISC license in `package.json`.

## Example JSON Requests

### Register a user

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "customer"
}
```

### Create a job

```json
{
  "service": "Plumbing",
  "description": "Fix leaking kitchen sink pipe",
  "location": "Lagos, Nigeria",
  "price": 25000
}
```

## Troubleshooting

- Ensure MongoDB is running before starting the app.
- Confirm the `.env` file contains valid `MONGODB_URI` and `jwt_secret` values.
- If you receive unauthorized errors, make sure the request includes a valid Bearer token.

## Future Improvements

Possible enhancements for this project include:

- input validation middleware
- better error handling and standardized response objects
- rate limiting and request throttling
- file uploads for service proof or documentation
- admin dashboard or analytics endpoints
- unit and integration tests

