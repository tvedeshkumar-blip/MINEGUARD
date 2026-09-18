import os
from typing import Literal, Optional
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

class VisionSettings(BaseModel):
    # Camera Source
    camera_source: Literal["esp32", "simulator", "file"] = Field(
        default=os.getenv("CAMERA_SOURCE", "simulator")  # type: ignore
    )
    esp32_cam_url: str = Field(
        default=os.getenv("ESP32_CAM_URL", "http://192.168.1.100")
    )
    esp32_stream_endpoint: str = Field(
        default=os.getenv("ESP32_STREAM_ENDPOINT", "/stream")
    )
    esp32_connection_timeout: float = Field(
        default=float(os.getenv("ESP32_CONNECT_TIMEOUT", "4.0"))
    )
    esp32_read_timeout: float = Field(
        default=float(os.getenv("ESP32_READ_TIMEOUT", "6.0"))
    )
    test_video_path: Optional[str] = Field(
        default=os.getenv("TEST_VIDEO_PATH", None)
    )

    # Server Ports
    vision_host: str = Field(default=os.getenv("VISION_HOST", "0.0.0.0"))
    vision_port: int = Field(default=int(os.getenv("VISION_PORT", "8001")))

    # AI Detection
    ai_detection_enabled: bool = Field(
        default=os.getenv("AI_DETECTION_ENABLED", "true").lower() in ("true", "1", "yes")
    )
    model_type: Literal["pretrained", "custom"] = Field(
        default=os.getenv("MODEL_TYPE", "pretrained")  # type: ignore
    )
    yolo_model: str = Field(default=os.getenv("YOLO_MODEL", "yolo11n.pt"))
    custom_model_path: Optional[str] = Field(default=os.getenv("CUSTOM_MODEL_PATH", None))
    yolo_confidence: float = Field(default=float(os.getenv("YOLO_CONFIDENCE", "0.40")))
    yolo_iou: float = Field(default=float(os.getenv("YOLO_IOU", "0.45")))
    ai_device: str = Field(default=os.getenv("AI_DEVICE", "auto"))

    # Pseudo-Thermal Engine
    thermal_enabled: bool = Field(
        default=os.getenv("THERMAL_ENABLED", "true").lower() in ("true", "1", "yes")
    )
    thermal_colormap: str = Field(default=os.getenv("THERMAL_COLORMAP", "INFERNO"))
    thermal_hotspot_threshold: float = Field(
        default=float(os.getenv("THERMAL_HOTSPOT_THRESHOLD", "0.80"))
    )
    hotspot_min_area: int = Field(
        default=int(os.getenv("HOTSPOT_MIN_AREA", "120"))
    )

    # Frame Processing
    target_fps: int = Field(default=int(os.getenv("TARGET_FPS", "15")))
    ai_frame_skip: int = Field(default=int(os.getenv("AI_FRAME_SKIP", "2")))  # Run AI every N frames to conserve laptop CPU

settings = VisionSettings()
