import time
import asyncio
import urllib.request
import urllib.error
from typing import Optional
import cv2
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel, HttpUrl

from config import settings

router = APIRouter()

# Global state references injected by app.py
camera_source = None
frame_processor = None
active_mode = "thermal_ai"
active_websockets = set()

class ConfigUpdateRequest(BaseModel):
    camera_source: Optional[str] = None
    esp32_cam_url: Optional[str] = None
    esp32_stream_endpoint: Optional[str] = None
    ai_detection_enabled: Optional[bool] = None
    thermal_enabled: Optional[bool] = None
    thermal_colormap: Optional[str] = None
    thermal_hotspot_threshold: Optional[float] = None
    yolo_confidence: Optional[float] = None

class ConnectionTestRequest(BaseModel):
    esp32_cam_url: str
    esp32_stream_endpoint: str = "/stream"

@router.get("/health")
def get_health():
    global camera_source, frame_processor
    cam_status = camera_source.get_status() if camera_source else {"status": "offline", "fps": 0}
    ai_ready = frame_processor.detector.is_ready if frame_processor else False
    
    return {
        "status": "healthy" if cam_status.get("status") in ("ONLINE", "CONNECTING") else "degraded",
        "camera": cam_status.get("status", "offline").lower(),
        "source": cam_status.get("source", settings.camera_source),
        "ai": "ready" if ai_ready else "initializing",
        "thermal": "ready" if settings.thermal_enabled else "disabled",
        "fps": cam_status.get("fps", 0.0),
        "inference_ms": frame_processor._last_inference_ms if frame_processor else 0.0
    }

@router.get("/status")
def get_status():
    global camera_source, frame_processor
    cam_status = camera_source.get_status() if camera_source else {"status": "OFFLINE", "fps": 0}
    return {
        "camera": cam_status,
        "active_mode": active_mode,
        "detector": {
            "model": settings.yolo_model,
            "device": frame_processor.detector.device if frame_processor else "cpu",
            "confidence_threshold": settings.yolo_confidence,
            "is_ready": frame_processor.detector.is_ready if frame_processor else False
        },
        "thermal": {
            "enabled": settings.thermal_enabled,
            "colormap": settings.thermal_colormap,
            "hotspot_threshold": settings.thermal_hotspot_threshold,
            "disclaimer": "AI PSEUDO-THERMAL VISION: Relative visual intensity only, not calibrated infrared temperature."
        }
    }

@router.get("/config")
def get_config():
    return {
        "camera_source": settings.camera_source,
        "esp32_cam_url": settings.esp32_cam_url,
        "esp32_stream_endpoint": settings.esp32_stream_endpoint,
        "ai_detection_enabled": settings.ai_detection_enabled,
        "thermal_enabled": settings.thermal_enabled,
        "thermal_colormap": settings.thermal_colormap,
        "thermal_hotspot_threshold": settings.thermal_hotspot_threshold,
        "yolo_confidence": settings.yolo_confidence,
        "yolo_model": settings.yolo_model
    }

@router.post("/config")
def update_config(req: ConfigUpdateRequest):
    global camera_source, frame_processor
    from app import reconfigure_camera_source

    if req.camera_source and req.camera_source != settings.camera_source:
        settings.camera_source = req.camera_source  # type: ignore
        reconfigure_camera_source(req.camera_source)

    if req.esp32_cam_url:
        settings.esp32_cam_url = req.esp32_cam_url
        if hasattr(camera_source, "update_config"):
            camera_source.update_config(base_url=req.esp32_cam_url)

    if req.esp32_stream_endpoint:
        settings.esp32_stream_endpoint = req.esp32_stream_endpoint
        if hasattr(camera_source, "update_config"):
            camera_source.update_config(endpoint=req.esp32_stream_endpoint)

    if req.thermal_colormap and frame_processor:
        settings.thermal_colormap = req.thermal_colormap
        frame_processor.thermal_engine.set_colormap(req.thermal_colormap)

    if req.thermal_hotspot_threshold is not None and frame_processor:
        settings.thermal_hotspot_threshold = req.thermal_hotspot_threshold
        frame_processor.hotspot_detector.threshold_ratio = req.thermal_hotspot_threshold

    if req.yolo_confidence is not None and frame_processor:
        settings.yolo_confidence = req.yolo_confidence
        frame_processor.detector.confidence = req.yolo_confidence

    if req.ai_detection_enabled is not None:
        settings.ai_detection_enabled = req.ai_detection_enabled

    return {"success": True, "message": "Configuration updated", "current_config": get_config()}

@router.post("/test-connection")
def test_connection(req: ConnectionTestRequest):
    """Test reachability of an ESP32-CAM HTTP endpoint without altering running stream."""
    url = f"{req.esp32_cam_url.rstrip('/')}/{req.esp32_stream_endpoint.lstrip('/')}"
    try:
        req_obj = urllib.request.Request(url, headers={"User-Agent": "MINEGUARD-Ping/1.0"})
        with urllib.request.urlopen(req_obj, timeout=3.5) as resp:
            code = resp.getcode()
            content_type = resp.headers.get("Content-Type", "")
            return {
                "reachable": True,
                "statusCode": code,
                "contentType": content_type,
                "message": f"Successfully connected to ESP32-CAM at {url} (HTTP {code})"
            }
    except Exception as e:
        return {
            "reachable": False,
            "error": str(e),
            "message": f"Cannot reach ESP32-CAM at {url}: {str(e)}"
        }

@router.get("/frame")
def get_single_frame(mode: str = Query("thermal_ai", enum=["normal", "night", "ai_vision", "thermal", "thermal_ai"])):
    """Fetch single processed JPEG frame."""
    global camera_source, frame_processor
    if not camera_source or not frame_processor:
        raise HTTPException(status_code=503, detail="Camera service not ready")

    success, raw_frame = camera_source.get_frame()
    if not success or raw_frame is None:
        raise HTTPException(status_code=504, detail="No frame available from camera")

    processed, _ = frame_processor.process(raw_frame, mode=mode)
    _, encoded = cv2.imencode(".jpg", processed, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return Response(content=encoded.tobytes(), media_type="image/jpeg")

@router.get("/stream")
def get_mjpeg_stream(mode: str = Query("thermal_ai", enum=["normal", "night", "ai_vision", "thermal", "thermal_ai"])):
    """Multipart MJPEG video stream with selectable processing mode."""
    global camera_source, frame_processor

    def frame_generator():
        target_fps = 15.0
        frame_interval = 1.0 / target_fps

        while True:
            t_start = time.time()
            if camera_source and frame_processor:
                success, raw_frame = camera_source.get_frame()
                if success and raw_frame is not None:
                    proc_frame, _ = frame_processor.process(raw_frame, mode=mode)
                    _, jpg = cv2.imencode(".jpg", proc_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                    jpg_bytes = jpg.tobytes()

                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n'
                           b'Content-Length: ' + str(len(jpg_bytes)).encode() + b'\r\n\r\n' +
                           jpg_bytes + b'\r\n')

            # Rate limit stream generator
            elapsed = time.time() - t_start
            sleep_t = max(0.01, frame_interval - elapsed)
            time.sleep(sleep_t)

    return StreamingResponse(
        frame_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@router.websocket("/ws/vision")
async def websocket_vision_endpoint(websocket: WebSocket):
    """High-frequency metadata stream (FPS, detections, hotspots, status).
    Avoids sending heavy video bytes over WebSockets.
    """
    await websocket.accept()
    active_websockets.add(websocket)
    try:
        while True:
            # Broadcast latest metadata every ~150ms
            if camera_source and frame_processor:
                cam_status = camera_source.get_status()
                payload = {
                    "type": "vision_update",
                    "timestamp": time.time(),
                    "camera": cam_status,
                    "detections": frame_processor._last_detections,
                    "hotspots": frame_processor._last_hotspots,
                    "inference_ms": frame_processor._last_inference_ms,
                    "thermal": {
                        "enabled": settings.thermal_enabled,
                        "mode": "pseudo_estimated",
                        "status": "estimated",
                        "peak_intensity": frame_processor._last_peak_intensity,
                        "hotspot_count": len(frame_processor._last_hotspots),
                        "disclaimer": "AI PSEUDO-THERMAL: Relative visual intensity, not physical infrared temperature."
                    }
                }
                await websocket.send_json(payload)
            await asyncio.sleep(0.15)
    except WebSocketDisconnect:
        active_websockets.discard(websocket)
    except Exception:
        active_websockets.discard(websocket)
