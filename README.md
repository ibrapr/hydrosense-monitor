# HydroSense Monitor

A modern web application for monitoring hydroponic system parameters including pH, temperature, and electrical conductivity (EC) levels.

## Features

- Real-time monitoring of hydroponic parameters
- Visual trend indicators (↑ ↓ →) for parameter changes
- Alert system for out-of-range values
- Modern, responsive user interface
- Unit-based monitoring system
- Filter views for all readings or alerts only

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

## Usage

1. Enter a Unit ID in the input field
2. View real-time sensor readings
3. Toggle between all readings and alerts using the filter buttons
4. Monitor trend indicators for parameter changes
5. Check status classifications for each reading

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 