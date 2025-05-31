import React, { useState } from 'react';
import './App.css';

type Reading = {
  timestamp: string;
  readings: {
    pH: number;
    temp: number;
    ec: number;
  };
  classification: string;
};

function App() {
  const [unitId, setUnitId] = useState('');
  const [readings, setReadings] = useState<Reading[]>([]);
  const [alerts, setAlerts] = useState<Reading[]>([]);
  const [classification, setClassification] = useState<string | null>(null);
  const [showingAlerts, setShowingAlerts] = useState(false);

  const getPHTrendIndicator = (currentPH: number, readings: Reading[], index: number) => {
    if (index === 0) return '→'; // First reading has no trend
    const previousReading = readings[index - 1];
    const difference = currentPH - previousReading.readings.pH;
    if (Math.abs(difference) < 0.1) return '→'; // Stable
    return difference > 0 ? '↑' : '↓';
  };

  const getTrendClass = (trend: string) => {
    switch (trend) {
      case '↑': return 'trend-up';
      case '↓': return 'trend-down';
      default: return 'trend-stable';
    }
  };

  const fetchReadings = async () => {
    const res = await fetch(`http://localhost:8000/api/readings/${unitId}`);
    const data = await res.json();
    setReadings(data.alerts);
    setShowingAlerts(false);
  };

  const fetchAlerts = async () => {
    const res = await fetch(`http://localhost:8000/api/alerts/${unitId}`);
    const data = await res.json();
    setAlerts(data.alerts);
    setShowingAlerts(true);
  };

  const sendRandomReading = async () => {
    const randomReading = {
      unitId: unitId || 'unit-123',
      timestamp: new Date().toISOString(),
      readings: {
        pH: parseFloat((5 + Math.random() * 3).toFixed(2)),
        temp: parseFloat((20 + Math.random() * 5).toFixed(1)),
        ec: parseFloat((1 + Math.random()).toFixed(2)),
      },
    };

    const res = await fetch('http://localhost:8000/api/sensor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(randomReading),
    });

    const result = await res.json();
    setClassification(result.classification);
    fetchReadings();
  };

  return (
    <div className="App">
      <header className="header">
        <h1>HydroSense Monitor</h1>
      </header>

      <div className="filter-buttons">
        <input
          type="text"
          placeholder="Enter Unit ID"
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          className="unit-input"
        />
        <button 
          className={`filter-button ${!showingAlerts ? 'active' : ''}`} 
          onClick={fetchReadings}
        >
          Show All Readings
        </button>
        <button 
          className={`filter-button ${showingAlerts ? 'active' : ''}`} 
          onClick={fetchAlerts}
        >
          Show Alerts Only
        </button>
        <button className="filter-button" onClick={sendRandomReading}>
          Send Random Reading
        </button>
      </div>

      {classification && (
        <div className={`status-banner ${classification === 'Healthy' ? 'status-healthy' : 'status-attention'}`}>
          Last Reading Status: <strong>{classification}</strong>
        </div>
      )}

      <div className="readings-container">
        {(showingAlerts ? alerts : readings).map((item, idx) => (
          <div 
            key={idx} 
            className={`reading-card ${item.classification === 'Needs Attention' ? 'status-attention' : 'status-healthy'}`}
          >
            <div className="reading-timestamp">{new Date(item.timestamp).toLocaleString()}</div>
            
            <div className="reading-values">
              <div className="reading-group">
                <div className="reading-label">pH Level</div>
                <div className="reading-value">
                  {item.readings.pH}
                  <span className={`trend-indicator ${getTrendClass(getPHTrendIndicator(item.readings.pH, showingAlerts ? alerts : readings, idx))}`}>
                    {getPHTrendIndicator(item.readings.pH, showingAlerts ? alerts : readings, idx)}
                  </span>
                </div>
              </div>

              <div className="reading-group">
                <div className="reading-label">Temperature</div>
                <div className="reading-value">{item.readings.temp}°C</div>
              </div>

              <div className="reading-group">
                <div className="reading-label">EC Level</div>
                <div className="reading-value">{item.readings.ec} mS/cm</div>
              </div>
            </div>

            <div className={`reading-status ${item.classification === 'Healthy' ? 'status-healthy' : 'status-attention'}`}>
              {item.classification}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
