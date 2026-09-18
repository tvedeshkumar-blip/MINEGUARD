import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from camera import CameraSource, ESP32CamClient, SimulatorSource, FileSource
from inference import ObjectDetector, PseudoThermalEngine, HotspotDetector, FrameProcessor
import api.routes as api_module

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("mineguard.vision")

# Initialize modules
camera_source: CameraSource = None  # type: ignore
detector: ObjectDetector = None  # type: ignore
thermal_engine: PseudoThermalEngine = None  # type: ignore
hotspot_detector: HotspotDetector = None  # type: ignore
frame_processor: FrameProcessor = None  # type: ignore

def create_camera_source(source_type: str) -> CameraSource:
    if source_type == "esp32":
        logger.info(f"[CAMERA] Initializing ESP32-CAM Client -> {settings.esp32_cam_url}{settings.esp32_stream_endpoint}")
        return ESP32CamClient(
            base_url=settings.esp32_cam_url,
            endpoint=settings.esp32_stream_endpoint,
            connect_timeout=settings.esp32_connection_timeout,
            read_timeout=settings.esp32_read_timeout
        )
    elif source_type == "file" and settings.test_video_path:
        logger.info(f"[CAMERA] Initializing FileSource -> {settings.test_video_path}")
        return FileSource(file_path=settings.test_video_path)
    else:
        logger.info("[CAMERA] Initializing Synthetic Deep Tunnel Simulator")
        return SimulatorSource(width=640, height=480, target_fps=settings.target_fps)

def reconfigure_camera_source(source_type: str):
    global camera_source
    logger.info(f"[CAMERA] Reconfiguring source to: {source_type}")
    if camera_source:
        camera_source.stop()
    camera_source = create_camera_source(source_type)
    camera_source.start()
    api_module.camera_source = camera_source

@asynccontextmanager
async def lifespan(app: FastAPI):
    global camera_source, detector, thermal_engine, hotspot_detector, frame_processor
    logger.info("─── Starting MINEGUARD AI Pseudo-Thermal Vision Service ───")

    # 1. Initialize camera source
    camera_source = create_camera_source(settings.camera_source)
    camera_source.start()
    api_module.camera_source = camera_source

    # 2. Initialize inference engines
    detector = ObjectDetector(
        model_name=settings.yolo_model,
        model_type=settings.model_type,
        custom_path=settings.custom_model_path,
        confidence=settings.yolo_confidence,
        iou=settings.yolo_iou,
        device=settings.ai_device
    )
    detector.load()

    thermal_engine = PseudoThermalEngine(colormap_name=settings.thermal_colormap)
    hotspot_detector = HotspotDetector(
        threshold_ratio=settings.thermal_hotspot_threshold,
        min_area=settings.hotspot_min_area
    )

    frame_processor = FrameProcessor(
        detector=detector,
        thermal_engine=thermal_engine,
        hotspot_detector=hotspot_detector,
        ai_frame_skip=settings.ai_frame_skip
    )
    api_module.frame_processor = frame_processor

    logger.info("[VISION] AI Pipeline active and listening on port " + str(settings.vision_port))
    yield

    logger.info("─── Stopping MINEGUARD AI Vision Service ───")
    if camera_source:
        camera_source.stop()

app = FastAPI(
    title="MINEGUARD AI Pseudo-Thermal Vision Service",
    description="ESP32-CAM ingestion, YOLO pretrained inference, and AI Pseudo-Thermal heatmap engine.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(api_module.router, prefix="/api/vision")
# Also mount root /health and /stream for convenience
app.include_router(api_module.router, prefix="")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host=settings.vision_host, port=settings.vision_port, reload=False)
