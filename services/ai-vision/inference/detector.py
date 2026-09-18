import os
import logging
from typing import List, Dict, Any, Optional
import numpy as np

logger = logging.getLogger("mineguard.inference.detector")

class ObjectDetector:
    """Pretrained YOLO Object Detector with hardware device selection,
    confidence filtering, and structured hazard output mapping.
    """

    # Hazard category classification mapping for mining context
    HAZARD_MAP = {
        "person": "PERSON",
        "car": "VEHICLE",
        "truck": "HEAVY_VEHICLE",
        "bus": "TRANSPORT_VEHICLE",
        "train": "LOCOMOTIVE",
        "traffic light": "SIGNAL_LIGHT",
        "fire hydrant": "SAFETY_EQUIPMENT",
        "stop sign": "SAFETY_HAZARD",
        "backpack": "GEAR",
        "suitcase": "EQUIPMENT",
        "bottle": "DEBRIS"
    }

    def __init__(self, model_name: str = "yolo11n.pt", 
                 model_type: str = "pretrained",
                 custom_path: Optional[str] = None,
                 confidence: float = 0.40, 
                 iou: float = 0.45,
                 device: str = "auto"):
        self.model_name = model_name
        self.model_type = model_type
        self.custom_path = custom_path
        self.confidence = confidence
        self.iou = iou
        self.device = self._select_device(device)
        self.model = None
        self._is_loaded = False

    def _select_device(self, requested: str) -> str:
        if requested == "cuda":
            try:
                import torch
                if torch.cuda.is_available():
                    return "cuda"
            except ImportError:
                pass
            return "cpu"
        elif requested == "auto":
            try:
                import torch
                if torch.cuda.is_available():
                    logger.info("[AI] CUDA acceleration detected and selected")
                    return "cuda"
            except ImportError:
                pass
            return "cpu"
        return requested

    def load(self) -> bool:
        """Load YOLO model weights cleanly."""
        try:
            from ultralytics import YOLO

            target_weights = self.custom_path if (self.model_type == "custom" and self.custom_path) else self.model_name
            logger.info(f"[AI] Loading YOLO model '{target_weights}' on device '{self.device}'...")
            
            # If yolo11n.pt fails due to version, fallback to yolov8n.pt
            try:
                self.model = YOLO(target_weights)
            except Exception as e:
                logger.warning(f"[AI] Failed loading {target_weights}: {e}. Falling back to 'yolov8n.pt'...")
                self.model = YOLO("yolov8n.pt")
                self.model_name = "yolov8n.pt"

            self._is_loaded = True
            logger.info(f"[AI] Model '{self.model_name}' successfully loaded.")
            return True
        except Exception as e:
            logger.error(f"[AI] Error loading YOLO model: {e}", exc_info=True)
            self._is_loaded = False
            return False

    @property
    def is_ready(self) -> bool:
        return self._is_loaded and self.model is not None

    def detect(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """Run object detection on an RGB or BGR frame.
        Returns list of structured detections with bounding boxes.
        """
        if not self.is_ready or frame is None:
            return []

        try:
            results = self.model.predict(
                source=frame,
                conf=self.confidence,
                iou=self.iou,
                device=self.device,
                verbose=False
            )

            detections: List[Dict[str, Any]] = []
            if not results:
                return detections

            result = results[0]
            boxes = result.boxes
            if boxes is None:
                return detections

            names = result.names

            for box in boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                raw_name = names.get(cls_id, f"class_{cls_id}")
                hazard_type = self.HAZARD_MAP.get(raw_name.lower(), raw_name.upper())

                xyxy = box.xyxy[0].tolist()
                x1, y1, x2, y2 = [int(v) for v in xyxy]

                detections.append({
                    "class_name": raw_name,
                    "hazard_category": hazard_type,
                    "confidence": round(conf, 2),
                    "bbox": {
                        "x1": max(0, x1),
                        "y1": max(0, y1),
                        "x2": min(frame.shape[1], x2),
                        "y2": min(frame.shape[0], y2)
                    }
                })

            return detections
        except Exception as e:
            logger.error(f"[AI] Inference error: {e}")
            return []
