import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.resolve()))

import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_health_endpoint():
    with TestClient(app) as tc:
        response = tc.get("/api/vision/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "camera" in data
        assert "ai" in data
        assert "thermal" in data

def test_config_endpoints():
    with TestClient(app) as tc:
        response = tc.get("/api/vision/config")
        assert response.status_code == 200
        data = response.json()
        assert "camera_source" in data
        assert "thermal_colormap" in data

        # Test POST config update
        update_resp = tc.post("/api/vision/config", json={"thermal_colormap": "MAGMA"})
        assert update_resp.status_code == 200
        assert update_resp.json()["success"] is True

def test_test_connection_endpoint():
    with TestClient(app) as tc:
        # Invalid host should return reachable=False without crashing
        resp = tc.post("/api/vision/test-connection", json={
            "esp32_cam_url": "http://192.0.2.1:80",
            "esp32_stream_endpoint": "/stream"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["reachable"] is False

def test_single_frame_endpoint():
    with TestClient(app) as tc:
        resp = tc.get("/api/vision/frame?mode=thermal_ai")
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "image/jpeg"
        assert len(resp.content) > 500
