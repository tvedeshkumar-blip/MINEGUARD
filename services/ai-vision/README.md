# MINEGUARD AI Pseudo-Thermal Vision Service

High-performance Python microservice for real-time ESP32-CAM ingestion, Ultralytics YOLO object detection, and OpenCV AI Pseudo-Thermal Heatmap visualization.

## Features
- **ESP32-CAM HTTP Streaming Client**: Ingests multipart MJPEG feeds and JPEG polling streams with connection timeouts and auto-reconnect logic.
- **Pretrained YOLO Object Detection**: Runs lightweight models (`yolo11n.pt` / `yolov8n.pt`) with CPU/CUDA hardware auto-detection.
- **AI Pseudo-Thermal Vision Engine**: Luminance extraction, CLAHE contrast enhancement, noise reduction, and radiometric colormapping (`COLORMAP_INFERNO`).
- **Relative Intensity Hotspot Detector**: Connected contour analysis with area filtering and severity levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Synthetic Deep Tunnel Simulator**: Procedural underground mine generation for testing without physical ESP32-CAM hardware.
- **FastAPI REST & WebSocket Server**: Low-latency video frame streaming via MJPEG and real-time metadata broadcasting via WebSocket.

## Quick Start (Local Setup)

```powershell
# 1. Navigate to directory
cd services/ai-vision

# 2. Create virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start vision service
python -m uvicorn app:app --host 0.0.0.0 --port 8001
```

## Running Tests
```powershell
.\.venv\Scripts\pytest tests/ -v
```

## Environment Variables
See `.env.example` for details:
- `CAMERA_SOURCE`: `esp32` | `simulator` | `file`
- `ESP32_CAM_URL`: `http://<ESP32_IP>`
- `ESP32_STREAM_ENDPOINT`: `/stream`
- `VISION_PORT`: `8001`
- `YOLO_CONFIDENCE`: `0.40`
- `THERMAL_HOTSPOT_THRESHOLD`: `0.80`
