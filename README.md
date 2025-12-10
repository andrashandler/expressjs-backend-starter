# Express Backend Starter Project

A simple Express.js backend for practicing API development in a local environment. Built with TypeScript, SQLite, and JWT authentication.

## Features

- Express.js with TypeScript
- SQLite database with Drizzle ORM
- JWT authentication (HttpOnly cookies)
- Zod validation
- Swagger API documentation
- User, List, and Todo models

## Requirements

- Node.js 22 LTS or higher
- npm

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/andrashandler/expressjs-backend-starter.git
cd expressjs-backend-starter
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Copy the example environment file and **CHANGE YOUR SECRETS !!!**:

```bash
cp .env.example .env
```

### 4. Run migrations and seed the database:

```bash
npm run db:migrate
npm run db:seed
```

### 5. Start the server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the server is running, visit:

```
http://localhost:3000/api-docs
```

## Test Users

The seed script creates two test users:

| Name       | Email            | Password    |
| ---------- | ---------------- | ----------- |
| John Smith | john@example.com | password123 |
| Jane Doe   | jane@example.com | password456 |

## Available Scripts

| Script               | Description                  |
| -------------------- | ---------------------------- |
| `npm run dev`        | Start development server     |
| `npm run db:migrate` | Run database migrations      |
| `npm run db:seed`    | Seed database with test data |

## API Endpoints

### Auth

- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

### Lists

- `GET /lists` - Get all lists
- `GET /lists/:id` - Get a list
- `POST /lists` - Create a list
- `PUT /lists/:id` - Update a list
- `DELETE /lists/:id` - Delete a list

### Todos

- `GET /lists/:listId/todos` - Get all todos in a list
- `GET /todos/:id` - Get a todo
- `POST /lists/:listId/todos` - Create a todo
- `PUT /todos/:id` - Update a todo
- `DELETE /todos/:id` - Delete a todo

## License

MIT
