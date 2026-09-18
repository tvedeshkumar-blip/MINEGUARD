import time
import logging
from typing import List, Dict, Any, Tuple, Optional
import cv2
import numpy as np

from .detector import ObjectDetector
from .thermal import PseudoThermalEngine
from .hotspot import HotspotDetector

logger = logging.getLogger("mineguard.inference.processor")

class FrameProcessor:
    """Coordinates camera frame retrieval, AI model execution,
    pseudo-thermal rendering, hotspot extraction, and HUD overlay rendering.
    """

    def __init__(self, 
                 detector: ObjectDetector, 
                 thermal_engine: PseudoThermalEngine, 
                 hotspot_detector: HotspotDetector,
                 ai_frame_skip: int = 2):
        self.detector = detector
        self.thermal_engine = thermal_engine
        self.hotspot_detector = hotspot_detector
        self.ai_frame_skip = ai_frame_skip

        self._frame_count: int = 0
        self._last_detections: List[Dict[str, Any]] = []
        self._last_hotspots: List[Dict[str, Any]] = []
        self._last_inference_ms: float = 0.0
        self._last_peak_intensity: float = 0.0

    def process(self, raw_bgr: np.ndarray, mode: str = "normal") -> Tuple[np.ndarray, Dict[str, Any]]:
        """Process a raw BGR frame according to the active vision mode:
        'normal', 'night', 'ai_vision', 'thermal', 'thermal_ai'.
        
        Returns:
            processed_bgr: The visual frame ready for JPEG encoding / streaming.
            metadata: Structured telemetry dictionary with detections, hotspots, latency.
        """
        self._frame_count += 1
        start_t = time.perf_counter()

        # Run AI detection on configured cadence or when previous cache is empty
        should_run_ai = (self._frame_count % self.ai_frame_skip == 0) or len(self._last_detections) == 0

        # Always compute pseudo-thermal if mode requires it or if running hotspot analysis
        needs_thermal = mode in ("thermal", "thermal_ai")
        thermal_bgr = None
        intensity_map = None

        if needs_thermal or (should_run_ai and mode == "thermal_ai"):
            thermal_bgr, intensity_map, self._last_peak_intensity = self.thermal_engine.process_frame(raw_bgr)
            if should_run_ai and intensity_map is not None:
                self._last_hotspots = self.hotspot_detector.detect_hotspots(intensity_map)

        if should_run_ai and mode in ("ai_vision", "thermal_ai"):
            # Run YOLO detector
            self._last_detections = self.detector.detect(raw_bgr)
            self._last_inference_ms = round((time.perf_counter() - start_t) * 1000.0, 1)

        # ── Render Visual Frame according to Mode ──
        if mode == "night":
            output_frame = self._render_night_vision(raw_bgr)
        elif mode == "thermal":
            if thermal_bgr is None:
                thermal_bgr, _, _ = self.thermal_engine.process_frame(raw_bgr)
            output_frame = thermal_bgr.copy()
            self._render_thermal_hud(output_frame, show_hotspots=False)
        elif mode == "thermal_ai":
            if thermal_bgr is None:
                thermal_bgr, _, _ = self.thermal_engine.process_frame(raw_bgr)
            output_frame = thermal_bgr.copy()
            self._render_hotspots(output_frame, self._last_hotspots)
            self._render_detections(output_frame, self._last_detections, is_thermal=True)
            self._render_thermal_hud(output_frame, show_hotspots=True)
        elif mode == "ai_vision":
            output_frame = raw_bgr.copy()
            self._render_detections(output_frame, self._last_detections, is_thermal=False)
        else: # "normal"
            output_frame = raw_bgr.copy()

        total_proc_ms = round((time.perf_counter() - start_t) * 1000.0, 1)

        metadata = {
            "frame_id": self._frame_count,
            "timestamp": time.time(),
            "mode": mode,
            "inference_ms": self._last_inference_ms,
            "processing_ms": total_proc_ms,
            "detections": self._last_detections,
            "hotspots": self._last_hotspots,
            "thermal": {
                "enabled": True,
                "mode": "pseudo_estimated",
                "peak_intensity": round(self._last_peak_intensity, 2),
                "hotspot_count": len(self._last_hotspots),
                "colormap": self.thermal_engine.colormap_name,
                "disclaimer": "AI PSEUDO-THERMAL ESTIMATION: Relative visual intensity only, not calibrated infrared temperature."
            }
        }

        return output_frame, metadata

    def _render_night_vision(self, frame: np.ndarray) -> np.ndarray:
        """Digital IR Night Vision simulation with green-phosphor amplification."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        boosted = cv2.equalizeHist(gray)
        # Green monochrome phosphor tint
        h, w = frame.shape[:2]
        green_frame = np.zeros((h, w, 3), dtype=np.uint8)
        green_frame[:, :, 1] = boosted
        green_frame[:, :, 0] = (boosted * 0.15).astype(np.uint8)
        green_frame[:, :, 2] = (boosted * 0.15).astype(np.uint8)
        return green_frame

    def _render_detections(self, frame: np.ndarray, detections: List[Dict[str, Any]], is_thermal: bool = False) -> None:
        """Draw high-tech tactical bounding boxes and labels."""
        for det in detections:
            bbox = det["bbox"]
            x1, y1, x2, y2 = bbox["x1"], bbox["y1"], bbox["x2"], bbox["y2"]
            cat = det.get("hazard_category", "OBJECT")
            conf = int(det["confidence"] * 100)
            label = f"{cat} [{conf}%]"

            # Color coding: Person / Hazard = orange/cyan/red
            box_color = (0, 255, 255) if is_thermal else (34, 197, 94)
            if cat in ("PERSON", "SAFETY_HAZARD"):
                box_color = (0, 165, 255) if is_thermal else (22, 115, 249)

            # Draw corner brackets for sleek HUD look
            cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)

            # Label banner
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
            cv2.rectangle(frame, (x1, max(0, y1 - 20)), (x1 + tw + 8, y1), box_color, -1)
            cv2.putText(frame, label, (x1 + 4, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 1, cv2.LINE_AA)

    def _render_hotspots(self, frame: np.ndarray, hotspots: List[Dict[str, Any]]) -> None:
        """Highlight detected thermal anomaly regions."""
        for hs in hotspots:
            x, y, w, h = hs["x"], hs["y"], hs["width"], hs["height"]
            sev = hs["severity"]
            intensity = int(hs["intensity"] * 100)

            color = (0, 0, 255) if sev == "CRITICAL" else (0, 165, 255) if sev == "HIGH" else (0, 255, 255)
            # Dashed or glowing rectangle
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)

            badge = f"HOTSPOT: {intensity}% [{sev}]"
            (tw, th), _ = cv2.getTextSize(badge, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)
            cv2.rectangle(frame, (x, y + h), (x + tw + 6, y + h + 16), color, -1)
            cv2.putText(frame, badge, (x + 3, y + h + 12), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0), 1, cv2.LINE_AA)

    def _render_thermal_hud(self, frame: np.ndarray, show_hotspots: bool = False) -> None:
        """Burn transparent scientific disclaimer badge directly onto thermal frames."""
        h, w = frame.shape[:2]
        badge_text = "AI PSEUDO-THERMAL • RELATIVE VISUAL INTENSITY"
        cv2.putText(frame, badge_text, (12, h - 14), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (255, 255, 255), 1, cv2.LINE_AA)
