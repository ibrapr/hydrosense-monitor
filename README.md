# HydroSense Monitor

A modern web application for monitoring hydroponic system parameters including pH, temperature, and electrical conductivity (EC) levels.

## Features

- Real-time monitoring of hydroponic parameters
- Visual trend indicators (↑ ↓ →) for parameter changes
- Alert system for out-of-range values
- Modern, responsive user interface
- Unit-based monitoring system
- Filter views for all readings or alerts only

## Design Decisions

### 1. Rule Thresholds
- **pH Range**: 5.5 - 7.5 (Optimal range for most hydroponic crops)
  - Below 5.5: "Needs Attention" - Too acidic
  - Above 7.5: "Needs Attention" - Too alkaline
- **Temperature Range**: 18°C - 26°C (65°F - 79°F)
- **EC Range**: 0.8 - 3.0 mS/cm (Depending on crop type)

### 2. pH Trend Indicators
To help growers better understand their system's pH stability, we've added trend indicators (↑ ↓ →) next to pH readings. This enhancement helps growers:

- Quickly identify if pH is increasing (↑) or decreasing (↓)
- Spot stable pH levels (→)
- Detect gradual pH shifts before they become problems
- Make proactive adjustments to maintain optimal growing conditions

The trend is calculated by comparing each reading with the previous reading:
- ↑ (Rising): Current pH > Previous pH + 0.1
- ↓ (Falling): Current pH < Previous pH - 0.1
- → (Stable): Difference between readings ≤ 0.1

## Tech Stack

### Backend
- FastAPI (Python)
- Pydantic for data validation
- pytest for testing
- uvicorn for ASGI server

### Frontend
- React
- Modern CSS with custom styling
- Responsive design

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows
   # OR
   source venv/bin/activate     # Unix/MacOS
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   uvicorn app:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # OR
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # OR
   yarn start
   ```

## Testing

### Backend Tests

Run the Python tests:
```bash
cd backend
pytest tests/ -v
```

Implemented test cases:
1. `test_post_sensor_reading_healthy`: Verifies correct classification of healthy readings
   - Tests pH within range (5.5-7.5)
   - Tests temperature within range (18-26°C)
   - Tests EC within range (0.8-3.0 mS/cm)

2. `test_post_sensor_reading_needs_attention`: Checks alert generation for out-of-range values
   - Tests pH below 5.5 (too acidic)
   - Tests pH above 7.5 (too alkaline)
   - Tests temperature outside range
   - Tests EC outside range

3. `test_get_readings`: Validates retrieval of sensor readings
   - Verifies correct number of readings returned
   - Checks chronological ordering
   - Validates reading format and structure

4. `test_get_alerts`: Ensures proper alert filtering
   - Verifies only "Needs Attention" readings are returned
   - Checks alert count accuracy
   - Validates alert criteria

5. `test_invalid_sensor_data`: Verifies handling of malformed data
   - Tests missing required fields
   - Tests invalid data types
   - Tests out-of-range values

6. `test_out_of_order_timestamps`: Confirms chronological ordering of readings
   - Tests readings submitted out of sequence
   - Verifies correct timestamp sorting
   - Checks data integrity

7. `test_ph_trend_indicators`: Validates pH trend calculation
   - Tests rising trend (↑) when pH increases by >0.1
   - Tests falling trend (↓) when pH decreases by >0.1
   - Tests stable trend (→) when pH change ≤0.1

### Production-Critical Test Cases

We have implemented two critical test cases to ensure robust operation in real-world scenarios:

1. **Out-of-Order Timestamp Handling** (Implemented)
   - **Problem**: Sensor readings may arrive out of sequence due to:
     - Network latency
     - Multiple sensor units reporting simultaneously
     - System clock discrepancies
   - **Implementation**:
     - Readings are stored with timestamps
     - API ensures chronological ordering regardless of submission order
     - Duplicate timestamps are handled gracefully

2. **Malformed JSON Data** (Not Implemented)
   - **Problem**: Production systems must handle:
     - Missing required fields
     - Invalid data types
     - Out-of-range values
     - Malformed JSON
   - **Potential Implementation**:
     - Strong input validation using Pydantic models
     - Clear error messages for debugging
     - Graceful error responses
     - Logging of validation failures

## Usage

1. Enter a Unit ID in the input field
2. View real-time sensor readings
3. Toggle between all readings and alerts using the filter buttons
4. Monitor trend indicators for parameter changes
5. Check status classifications for each reading

![image](https://github.com/user-attachments/assets/907a53f9-1336-4ee6-bf1c-402f2cb2b9ad)

"Send Random Reading" button:

![image](https://github.com/user-attachments/assets/40ed2024-65b8-47a6-89d0-52df8632c010)

"Show All Readings" button(shows all readings Healthy/Need Attention last 10 readings):

![image](https://github.com/user-attachments/assets/1511c2ce-097d-40a8-a438-b9c0a2cef0d3)

"Show Alerts Only" button(shows only all Need Attention readings last 10 readings):

![image](https://github.com/user-attachments/assets/5323bfeb-154e-45d3-ae17-1135c404bb78)


