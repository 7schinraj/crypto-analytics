# Crypto Backend

This is a FastAPI-based backend for a crypto analytics application.

## Structure
The project follows a modular architecture:
- `backend/core/`: Core configurations, database setup, and logging.
- `backend/modules/`: Business logic divided into market, analytics, and strategy modules.
- `backend/external/`: Integrations with external APIs (e.g., Binance).
- `backend/scheduler.py`: Background tasks and scheduling.

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the application:
   ```bash
   python run.py
   ```
   *This will start the server on `0.0.0.0:8000` with auto-reload enabled.*

3. Health Check:
   Visit `http://localhost:8000/health` to verify the setup.

## Database
Uses SQLite by default. Connection details are in `.env`.
