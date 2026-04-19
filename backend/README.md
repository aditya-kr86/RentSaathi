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
- `GET /api/waitlist/count` - Get total waitlist count
- `GET /api/waitlist` - Get all waitlist emails (admin)

## Environment Variables

See `.env.example` for all available options.

## Database

The backend uses SQLAlchemy ORM with SQLite by default. You can switch to PostgreSQL or MySQL by changing the `DATABASE_URL` in `.env`.

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
