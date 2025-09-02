# Node.js + MySQL Backend (Express)

This backend is designed to work with your React frontend. It exposes:

- `GET /api/health` — health check
- `POST /api/register` — create user, returns `{ success, token, user }`
- `POST /api/login` — login, returns `{ success, token, user }`
- `GET /api/profile` — get current user profile (requires `Authorization: Bearer <token>`)
- `POST /api/bookings` — create a booking (requires auth)
- `GET /api/bookings` — list current user's bookings (requires auth)

## 1) Install dependencies
```bash
cd backend
npm install
```

## 2) Configure environment
Copy `.env.example` to `.env` and set your values:
```bash
cp .env.example .env
```

## 3) Prepare MySQL
- Ensure MySQL is running and you have a user with permissions.
- Create the database and tables by running `schema.sql`:
```bash
# in MySQL shell or any client:
SOURCE /absolute/path/to/backend/schema.sql;
```
Or copy the SQL and run it manually.

## 4) Run the server
```bash
npm run dev   # uses nodemon (auto-restart)
# or
npm start
```

The server runs on port **8000** by default and expects the frontend to call `http://localhost:8000/api`.

## Notes
- Passwords are hashed using bcrypt.
- JWT tokens are signed with `JWT_SECRET` and expire in 7 days.
- CORS is enabled.
- Uses `mysql2/promise` with a connection pool.
