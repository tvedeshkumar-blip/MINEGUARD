import time
import math
import cv2
import numpy as np
from typing import Tuple, Optional, Dict, Any
from .camera_source import CameraSource

class SimulatorSource(CameraSource):
    """Synthetic underground mining tunnel video generator.
    Generates realistic underground tunnel perspectives with dynamic rock walls,
    miner silhouettes, and hot drill/machinery components for complete AI
    and pseudo-thermal testing without physical hardware.
    """

    def __init__(self, width: int = 640, height: int = 480, target_fps: int = 15):
        self.width = width
        self.height = height
        self.target_fps = target_fps
        self._running = False
        self._start_time = time.time()
        self._frame_count = 0

    def start(self) -> None:
        self._running = True
        self._start_time = time.time()

    def stop(self) -> None:
        self._running = False

    def get_status(self) -> Dict[str, Any]:
        return {
            "source": "simulator",
            "status": "ONLINE",
            "fps": float(self.target_fps),
            "resolution": f"{self.width}x{self.height}",
            "description": "MINEGUARD Synthetic Deep Tunnel Simulation"
        }

    def get_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        if not self._running:
            return False, None

        t = time.time() - self._start_time
        self._frame_count += 1

        # Base dark tunnel canvas
        frame = np.zeros((self.height, self.width, 3), dtype=np.uint8)

        # 1. Perspective Tunnel Walls & Ceiling
        vp_x, vp_y = self.width // 2, int(self.height * 0.45)  # Vanishing point

        # Tunnel Arch gradient
        for y in range(self.height):
            for step in range(0, self.width, 4):
                dist_vp = math.hypot(step - vp_x, y - vp_y)
                val = int(max(15, 65 - (dist_vp * 0.12)))
                frame[y, step:step+4] = (int(val * 0.7), int(val * 0.8), val)

        # Tunnel Ribs (supporting steel arches)
        for i in range(1, 6):
            phase = (t * 0.4 + i * 0.5) % 3.0
            scale = phase / 3.0
            arch_w = int(self.width * 0.9 * scale)
            arch_h = int(self.height * 0.85 * scale)
            x1 = vp_x - arch_w // 2
            y1 = vp_y - int(arch_h * 0.4)
            x2 = vp_x + arch_w // 2
            y2 = self.height

            if arch_w > 20 and arch_h > 20:
                color = (int(45 * scale), int(55 * scale), int(65 * scale))
                cv2.ellipse(frame, (vp_x, y1 + arch_h // 2), (arch_w // 2, arch_h // 2), 0, 180, 360, color, 3)

        # Ground Rail Tracks
        rail_color = (80, 85, 95)
        cv2.line(frame, (vp_x - 10, vp_y + 15), (50, self.height - 10), rail_color, 4)
        cv2.line(frame, (vp_x + 10, vp_y + 15), (self.width - 50, self.height - 10), rail_color, 4)

        # Cross ties / sleepers on rails
        for step_y in range(vp_y + 25, self.height, 28):
            prog = (step_y - vp_y) / (self.height - vp_y)
            rx1 = int(vp_x - 10 - prog * (vp_x - 60))
            rx2 = int(vp_x + 10 + prog * (self.width - 60 - vp_x))
            cv2.line(frame, (rx1, step_y), (rx2, step_y), (40, 45, 50), 2)

        # 2. Moving Worker Silhouette (Person Detection Target for YOLO)
        person_x = int(vp_x + 60 + math.sin(t * 0.7) * 45)
        person_y = int(vp_y + 40)
        # Head (Hardhat in safety yellow)
        cv2.circle(frame, (person_x, person_y - 25), 9, (30, 200, 230), -1)
        # Body (Torso with reflective safety strip)
        cv2.rectangle(frame, (person_x - 11, person_y - 15), (person_x + 11, person_y + 25), (40, 100, 180), -1)
        cv2.rectangle(frame, (person_x - 9, person_y - 2), (person_x + 9, person_y + 4), (200, 255, 255), -1)
        # Legs
        cv2.line(frame, (person_x - 6, person_y + 25), (person_x - 8, person_y + 55), (35, 35, 45), 4)
        cv2.line(frame, (person_x + 6, person_y + 25), (person_x + 8, person_y + 55), (35, 35, 45), 4)

        # 3. High-Intensity Machinery / Thermal Anomaly Target (Electric drill / hydraulic pump)
        drill_x = int(vp_x - 110)
        drill_y = int(vp_y + 70)
        # Machine chassis
        cv2.rectangle(frame, (drill_x - 30, drill_y - 25), (drill_x + 30, drill_y + 25), (55, 60, 65), -1)
        
        # Overheated motor housing / exhaust glow (High luminance -> will produce thermal hotspot!)
        pulse = 0.85 + 0.15 * math.sin(t * 3.0)
        glow_val = int(240 * pulse)
        # Bright warm glow in RGB
        cv2.circle(frame, (drill_x, drill_y), 16, (glow_val, glow_val, glow_val), -1)
        cv2.circle(frame, (drill_x, drill_y), 8, (255, 255, 255), -1)

        # Add subtle camera noise & scanline texture for authenticity
        noise = np.random.normal(0, 3, frame.shape).astype(np.int16)
        frame = np.clip(frame.astype(np.int16) + noise, 0, 255).astype(np.uint8)

        return True, frame
