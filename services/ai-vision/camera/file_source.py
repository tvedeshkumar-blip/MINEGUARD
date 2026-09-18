import time
import os
import cv2
import numpy as np
from typing import Tuple, Optional, Dict, Any
from .camera_source import CameraSource

class FileSource(CameraSource):
    """Camera source that reads frames from a local video file or image on a loop.
    Allows repeatable deterministic testing and verification of AI and thermal features.
    """

    def __init__(self, file_path: str, target_fps: int = 15):
        self.file_path = file_path
        self.target_fps = target_fps
        self._running = False
        self._cap: Optional[cv2.VideoCapture] = None
        self._last_frame: Optional[np.ndarray] = None
        self._is_image = False
        self._resolution: Tuple[int, int] = (0, 0)

    def start(self) -> None:
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"Video/image file not found: {self.file_path}")

        # Check if single image
        ext = os.path.splitext(self.file_path)[1].lower()
        if ext in ('.jpg', '.jpeg', '.png', '.bmp', '.webp'):
            self._is_image = True
            img = cv2.imread(self.file_path)
            if img is None:
                raise ValueError(f"Failed to decode image: {self.file_path}")
            self._last_frame = img
            self._resolution = (img.shape[1], img.shape[0])
        else:
            self._is_image = False
            self._cap = cv2.VideoCapture(self.file_path)
            if not self._cap.isOpened():
                raise ValueError(f"Failed to open video file: {self.file_path}")
            w = int(self._cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            h = int(self._cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            self._resolution = (w, h)

        self._running = True

    def stop(self) -> None:
        self._running = False
        if self._cap:
            self._cap.release()
            self._cap = None

    def get_status(self) -> Dict[str, Any]:
        return {
            "source": "file",
            "status": "ONLINE" if self._running else "OFFLINE",
            "file_path": self.file_path,
            "resolution": f"{self._resolution[0]}x{self._resolution[1]}",
            "fps": float(self.target_fps)
        }

    def get_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        if not self._running:
            return False, None

        if self._is_image:
            return True, self._last_frame.copy() if self._last_frame is not None else None

        if self._cap is None:
            return False, None

        ret, frame = self._cap.read()
        if not ret:
            # Loop video to beginning
            self._cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret, frame = self._cap.read()

        if ret and frame is not None:
            self._last_frame = frame
            return True, frame.copy()

        return False, None
