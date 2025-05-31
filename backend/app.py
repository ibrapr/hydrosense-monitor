from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, List
import json
from collections import defaultdict

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SensorReading(BaseModel):
    unitId: str
    timestamp: datetime
    readings: Dict[str, float] = Field(..., description="Sensor readings including pH, temp, and ec")

class SensorResponse(BaseModel):
    status: str
    classification: str

# In-memory storage
readings_store = defaultdict(list)

def classify_reading(readings: Dict[str, float]) -> str:
    """Classify the reading based on pH value."""
    ph = readings.get("pH")
    if ph is None:
        raise HTTPException(status_code=400, detail="pH reading is required")
    
    if ph < 5.5 or ph > 7.0:
        return "Needs Attention"
    return "Healthy"

@app.post("/api/sensor", response_model=SensorResponse)
async def post_sensor_reading(reading: SensorReading):
    # Validate readings
    required_fields = {"pH", "temp", "ec"}
    if not all(field in reading.readings for field in required_fields):
        raise HTTPException(status_code=400, detail="Missing required readings")
    
    classification = classify_reading(reading.readings)
    
    # Store the reading with its classification
    stored_reading = {
        "timestamp": reading.timestamp.isoformat(),
        "readings": reading.readings,
        "classification": classification
    }
    readings_store[reading.unitId].append(stored_reading)
    
    return SensorResponse(status="OK", classification=classification)

@app.get("/api/readings/{unit_id}")
async def get_readings(unit_id: str):
    unit_readings = readings_store.get(unit_id, [])
    # Sort readings by timestamp before returning
    sorted_readings = sorted(unit_readings, key=lambda x: x["timestamp"])
    return {"alerts": sorted_readings[-10:]}

@app.get("/api/alerts/{unit_id}")
async def get_alerts(unit_id: str):
    unit_readings = readings_store.get(unit_id, [])
    # Filter only "Needs Attention" readings and sort by timestamp
    alerts = [
        reading for reading in unit_readings
        if reading["classification"] == "Needs Attention"
    ]
    sorted_alerts = sorted(alerts, key=lambda x: x["timestamp"])
    return {"alerts": sorted_alerts[-10:]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 