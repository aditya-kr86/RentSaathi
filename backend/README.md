# RentPartner Backend

Fast API backend for the RentPartner flatmate matching platform.

## Getting Started

### Prerequisites
- Python 3.8+
- pip

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

### Running the Server

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or simply:
```bash
python main.py
```

The API will be available at `http://localhost:8000`
- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## API Endpoints

### Health Check
- `GET /health` - Server health check

### Waitlist
- `POST /api/waitlist` - Join the waitlist
- `POST /waitlist` - Alias for waitlist join
- `GET /api/waitlist/count` - Get total waitlist count
- `GET /api/waitlist` - Get all waitlist emails (admin)

### Auth
- `POST /auth/register` - Register user and return JWT tokens
- `POST /auth/login` - Login user and return JWT tokens
- `POST /auth/refresh` - Refresh access token using refresh token
- `GET /auth/me` - Protected route; return current user profile

### Waitlist Rate Limiting
- Basic per-client rate limiting is enabled on `POST /api/waitlist` and `POST /waitlist`.
- Defaults: 5 requests per 60 seconds per client IP.
- Configure with:
  - `WAITLIST_RATE_LIMIT_MAX_REQUESTS`
  - `WAITLIST_RATE_LIMIT_WINDOW_SECONDS`

### Login Rate Limiting
- Basic per-client rate limiting is enabled on `POST /auth/login`.
- Defaults: 10 requests per 60 seconds per client IP.
- Configure with:
  - `LOGIN_RATE_LIMIT_MAX_REQUESTS`
  - `LOGIN_RATE_LIMIT_WINDOW_SECONDS`

## Environment Variables

See `.env.example` for all available options.

## Database

The backend uses SQLAlchemy ORM with SQLite by default. You can switch to PostgreSQL or MySQL by changing the `DATABASE_URL` in `.env`.

### Supabase PostgreSQL Setup

Use one of these patterns in `.env`:

1. Full URI directly (preferred)
```env
DATABASE_URL=postgresql+psycopg://postgres:your_password@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

2. URI template + password (keeps password separate)
```env
SUPABASE_DB_URI=postgresql+psycopg://postgres:<PASSWORD>@db.xxxxx.supabase.co:5432/postgres?sslmode=require
SUPABASE_DB_PASSWORD=your_password
```

Schema remains unchanged for Milestone 1: `waitlist_emails(id, email, created_at)`.

Milestone 2 adds: `users(id, email, password_hash, created_at, is_premium)`.

### Auth Security

- Password hashing uses `bcrypt` via `passlib`.
- Access and refresh JWT tokens are signed with `JWT_SECRET_KEY`.
- Configure token settings with:
  - `JWT_SECRET_KEY`
  - `JWT_ALGORITHM`
  - `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`
  - `JWT_REFRESH_TOKEN_EXPIRE_DAYS`

## CORS

CORS is configured to allow requests from:
- `http://localhost:3000`
- `http://localhost:5173` (Vite dev server)

Update the `origins` list in `main.py` for production.

## Deployment

The backend can be deployed to:
- Render (https://render.com)
- Fly.io (https://fly.io)
- Heroku
- AWS (Elastic Beanstalk, Lambda)

## Development

- Run tests: `pytest`
- Format code: `black .`
- Lint code: `pylint *.py`
