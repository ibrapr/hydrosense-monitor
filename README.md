# HydroSense Monitor

A real-time monitoring system for hydroponic growing operations that tracks pH, temperature, and electrical conductivity (EC) readings.

## Features

- Real-time sensor data monitoring
- Alert system for out-of-range pH values
- Historical data viewing
- Filtering between all readings and alerts
- pH Trend Indicators with visual indicators (↑ ↓ →)
- Chronological ordering of readings regardless of submission time

## Design Decisions

### 1. Rule Thresholds
- **pH Range**: 5.5 - 7.5 (Optimal range for most hydroponic crops)
  - Below 5.5: "Needs Attention" - Too acidic
  - Above 7.5: "Needs Attention" - Too alkaline
- **Temperature Range**: 18°C - 26°C (65°F - 79°F)
- **EC Range**: 0.8 - 3.0 mS/cm (Depending on crop type)

### 2. Enhancement: pH Trend Indicators
To help growers better understand their system's pH stability, we've added trend indicators (↑ ↓ →) next to pH readings. This enhancement helps growers:

- Quickly identify if pH is increasing (↑) or decreasing (↓)
- Spot stable pH levels (→)
- Detect gradual pH shifts before they become problems
- Make proactive adjustments to maintain optimal growing conditions

The trend is calculated by comparing each reading with the previous reading:
- ↑ (Rising): Current pH > Previous pH + 0.1
- ↓ (Falling): Current pH < Previous pH - 0.1
- → (Stable): Difference between readings ≤ 0.1

### 3. Data Management
- Readings are stored chronologically regardless of submission order
- Last 10 readings are displayed for quick monitoring
- Alert history is maintained separately for focused issue tracking

## Setup and Running

### Using Docker (Recommended)

1. Clone the repository
2. Build and run using Docker Compose:
   ```bash
   docker-compose up --build
   ```
   This will start both frontend and backend services.
   - Frontend: http://localhost:80
   - Backend: http://localhost:8000

### Manual Setup (Development)

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate # Linux/Mac
   pip install -r requirements.txt
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
4. Start the backend server:
   ```bash
   cd backend
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate # Linux/Mac
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```
5. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

The application will be available at http://localhost:3000

## Testing

### Backend Tests

Run the Python tests:
```bash
cd backend
pytest tests/ -v
```

Implemented test cases:
1. `test_post_sensor_reading_healthy`: Verifies correct classification of healthy readings
2. `test_post_sensor_reading_needs_attention`: Checks alert generation for out-of-range values
3. `test_get_readings`: Validates retrieval of sensor readings
4. `test_get_alerts`: Ensures proper alert filtering
5. `test_invalid_sensor_data`: Verifies handling of malformed data
6. `test_out_of_order_timestamps`: Confirms chronological ordering of readings

### Frontend Tests

Run the React tests:
```bash
cd frontend
npm test
```

Key test cases:
1. Component rendering tests
2. pH trend indicator logic
3. Alert filtering functionality
4. Data sorting and display

## CI/CD Pipeline

The project includes a GitHub Actions workflow (`/.github/workflows/ci-cd.yml`) that:
1. Runs backend tests using pytest
2. Executes frontend tests with Jest
3. Builds the React application
4. Optionally builds and pushes Docker images to Docker Hub
   - Requires `DOCKER_HUB_USERNAME` and `DOCKER_HUB_TOKEN` secrets

## API Endpoints

### POST /api/sensor
Accepts sensor readings and returns classification:
```json
{
  "unitId": "unit-123",
  "timestamp": "2025-05-24T12:34:56Z",
  "readings": {
    "pH": 6.5,
    "temp": 22.1,
    "ec": 1.2
  }
}
```

### GET /api/readings/{unit_id}
Returns the last 10 readings for a specific unit, sorted by timestamp.

### GET /api/alerts/{unit_id}
Returns the last 10 "Needs Attention" readings for a specific unit.

## Technologies Used

- Backend:
  - Python 3.12
  - FastAPI
  - pytest
  - uvicorn

- Frontend:
  - React 18
  - TypeScript
  - Jest + React Testing Library
  - nginx (production)

## License

MIT 