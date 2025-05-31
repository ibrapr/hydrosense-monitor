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
    fetchReadings(); // refresh readings list
  };

  return (
    <div className="App">
      <h1>HydroSense Monitor</h1>

      <div>
        <input
          type="text"
          placeholder="Enter Unit ID"
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
        />
        <button onClick={fetchReadings}>Show All Readings</button>
        <button onClick={fetchAlerts}>Show Alerts Only</button>
        <button onClick={sendRandomReading}>Send Random Reading</button>
        {classification && <p>Last Classification: <b>{classification}</b></p>}
      </div>

      <table style={{ marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>pH</th>
            <th>Temp</th>
            <th>EC</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {(showingAlerts ? alerts : readings).map((item, idx) => (
            <tr
              key={idx}
              style={{
                backgroundColor: item.classification === 'Needs Attention' ? '#ffcccc' : '#ccffcc',
              }}
            >
              <td>{item.timestamp}</td>
              <td>
                {item.readings.pH} 
                <span style={{ marginLeft: '5px', fontWeight: 'bold' }}>
                  {getPHTrendIndicator(item.readings.pH, showingAlerts ? alerts : readings, idx)}
                </span>
              </td>
              <td>{item.readings.temp}</td>
              <td>{item.readings.ec}</td>
              <td>{item.classification}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
