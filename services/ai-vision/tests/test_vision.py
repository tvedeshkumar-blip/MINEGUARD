import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.resolve()))

import pytest
import numpy as np
import cv2

from camera.simulator_source import SimulatorSource

from camera.esp32_client import ESP32CamClient
from inference.thermal import PseudoThermalEngine
from inference.hotspot import HotspotDetector
from inference.detector import ObjectDetector
from inference.processor import FrameProcessor

def test_simulator_source():
    sim = SimulatorSource(width=320, height=240, target_fps=15)
    sim.start()
    success, frame = sim.get_frame()
    sim.stop()

    assert success is True
    assert frame is not None
    assert frame.shape == (240, 320, 3)
    assert frame.dtype == np.uint8
    assert sim.get_status()["status"] == "ONLINE"

def test_pseudo_thermal_engine():
    engine = PseudoThermalEngine(colormap_name="INFERNO")
    # Synthetic frame with dark background and bright warm spot
    bgr = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.circle(bgr, (50, 50), 20, (255, 255, 255), -1)

    thermal_bgr, norm_intensity, peak_val = engine.process_frame(bgr)

    assert thermal_bgr.shape == (100, 100, 3)
    assert norm_intensity.shape == (100, 100)
    assert 0.0 <= peak_val <= 1.0
    assert peak_val > 0.8  # Bright circle should have high peak intensity

def test_hotspot_detector():
    detector = HotspotDetector(threshold_ratio=0.75, min_area=30)
    intensity = np.zeros((100, 100), dtype=np.uint8)
    # Draw high intensity region
    cv2.circle(intensity, (50, 50), 15, 240, -1)

    hotspots = detector.detect_hotspots(intensity)
    assert len(hotspots) >= 1
    hs = hotspots[0]
    assert "x" in hs and "y" in hs and "width" in hs and "height" in hs
    assert "intensity" in hs and "severity" in hs
    assert hs["severity"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
    assert hs["intensity"] >= 0.75

def test_esp32_client_offline():
    # Attempting unreachable IP should gracefully set OFFLINE / CONNECTING without throwing uncaught exceptions
    client = ESP32CamClient(base_url="http://192.0.2.1", endpoint="/stream", connect_timeout=0.5)
    status = client.get_status()
    assert status["source"] == "esp32"
    assert status["status"] in ("OFFLINE", "CONNECTING")
    success, frame = client.get_frame()
    assert success is False
    assert frame is None

def test_frame_processor_modes():
    sim = SimulatorSource(width=320, height=240)
    sim.start()
    success, frame = sim.get_frame()
    sim.stop()
    assert success and frame is not None

    detector = ObjectDetector()  # doesn't need to load weights for mock check
    thermal = PseudoThermalEngine()
    hotspot = HotspotDetector()
    processor = FrameProcessor(detector, thermal, hotspot)

    for mode in ["normal", "night", "ai_vision", "thermal", "thermal_ai"]:
        out_frame, meta = processor.process(frame, mode=mode)
        assert out_frame is not None
        assert out_frame.shape == frame.shape
        assert meta["mode"] == mode
        assert "thermal" in meta
        assert "disclaimer" in meta["thermal"]
