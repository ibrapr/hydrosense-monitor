from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_post_sensor_reading_healthy():
    """Test posting a healthy sensor reading"""
    response = client.post(
        "/api/sensor",
        json={
            "unitId": "test-unit",
            "timestamp": "2025-05-24T12:34:56Z",
            "readings": {
                "pH": 6.5,
                "temp": 22.1,
                "ec": 1.2
            }
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert data["classification"] == "Healthy"

def test_post_sensor_reading_needs_attention():
    """Test posting a sensor reading that needs attention"""
    response = client.post(
        "/api/sensor",
        json={
            "unitId": "test-unit",
            "timestamp": "2025-05-24T12:34:56Z",
            "readings": {
                "pH": 4.5,  # pH too low
                "temp": 22.1,
                "ec": 1.2
            }
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert data["classification"] == "Needs Attention"

def test_get_readings():
    """Test getting readings for a unit"""
    # First post some readings
    client.post(
        "/api/sensor",
        json={
            "unitId": "test-unit-readings",
            "timestamp": "2025-05-24T12:34:56Z",
            "readings": {"pH": 6.5, "temp": 22.1, "ec": 1.2}
        }
    )
    
    response = client.get("/api/readings/test-unit-readings")
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data
    assert len(data["alerts"]) > 0

def test_get_alerts():
    """Test getting alerts (needs attention readings) for a unit"""
    # Post a reading that needs attention
    client.post(
        "/api/sensor",
        json={
            "unitId": "test-unit-alerts",
            "timestamp": "2025-05-24T12:34:56Z",
            "readings": {"pH": 4.5, "temp": 22.1, "ec": 1.2}
        }
    )
    
    response = client.get("/api/alerts/test-unit-alerts")
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data
    assert len(data["alerts"]) > 0
    assert all(alert["classification"] == "Needs Attention" for alert in data["alerts"])

def test_invalid_sensor_data():
    """Test handling of invalid sensor data"""
    response = client.post(
        "/api/sensor",
        json={
            "unitId": "test-unit",
            "timestamp": "2025-05-24T12:34:56Z",
            "readings": {
                "pH": "invalid",  # pH should be a number
                "temp": 22.1,
                "ec": 1.2
            }
        }
    )
    assert response.status_code == 422  # Validation error

def test_out_of_order_timestamps():
    """Test that readings are returned in chronological order regardless of insertion order"""
    # Post readings in non-chronological order
    readings = [
        {
            "unitId": "test-unit-order",
            "timestamp": "2025-05-24T12:34:56Z",
            "readings": {"pH": 6.5, "temp": 22.1, "ec": 1.2}
        },
        {
            "unitId": "test-unit-order",
            "timestamp": "2025-05-24T10:00:00Z",  # Earlier timestamp
            "readings": {"pH": 6.7, "temp": 22.3, "ec": 1.3}
        },
        {
            "unitId": "test-unit-order",
            "timestamp": "2025-05-24T15:00:00Z",  # Later timestamp
            "readings": {"pH": 6.3, "temp": 22.0, "ec": 1.1}
        }
    ]
    
    # Insert readings in non-chronological order
    for reading in readings:
        client.post("/api/sensor", json=reading)
    
    # Get readings and verify they are in chronological order
    response = client.get("/api/readings/test-unit-order")
    assert response.status_code == 200
    data = response.json()
    timestamps = [reading["timestamp"] for reading in data["alerts"]]
    assert timestamps == sorted(timestamps)  # Verify chronological order 