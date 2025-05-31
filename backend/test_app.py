from fastapi.testclient import TestClient
from datetime import datetime
import pytest
from app import app

client = TestClient(app)

def test_valid_sensor_reading():
    response = client.post(
        "/api/sensor",
        json={
            "unitId": "unit-123",
            "timestamp": "2025-05-24T12:34:56Z",
            "readings": {"pH": 6.5, "temp": 22.1, "ec": 1.2}
        }
    )
    assert response.status_code == 200
    assert response.json() == {"status": "OK", "classification": "Healthy"}

def test_needs_attention_reading():
    response = client.post(
        "/api/sensor",
        json={
            "unitId": "unit-123",
            "timestamp": "2025-05-24T12:34:56Z",
            "readings": {"pH": 5.0, "temp": 22.1, "ec": 1.2}
        }
    )
    assert response.status_code == 200
    assert response.json() == {"status": "OK", "classification": "Needs Attention"}

def test_invalid_reading():
    response = client.post(
        "/api/sensor",
        json={
            "unitId": "unit-123",
            "timestamp": "2025-05-24T12:34:56Z",
            "readings": {"temp": 22.1, "ec": 1.2}  # Missing pH
        }
    )
    assert response.status_code == 400

def test_get_alerts():
    # First, add some readings
    for ph in [5.0, 6.5, 4.5, 7.5]:
        client.post(
            "/api/sensor",
            json={
                "unitId": "test-unit",
                "timestamp": "2025-05-24T12:34:56Z",
                "readings": {"pH": ph, "temp": 22.1, "ec": 1.2}
            }
        )
    
    response = client.get("/api/alerts/test-unit")
    assert response.status_code == 200
    alerts = response.json()["alerts"]
    assert len([a for a in alerts if a["classification"] == "Needs Attention"]) > 0

def test_malformed_timestamp():
    response = client.post(
        "/api/sensor",
        json={
            "unitId": "unit-123",
            "timestamp": "invalid-timestamp",
            "readings": {"pH": 6.5, "temp": 22.1, "ec": 1.2}
        }
    )
    assert response.status_code == 422  # Validation error 