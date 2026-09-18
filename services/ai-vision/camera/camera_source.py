from abc import ABC, abstractmethod
from typing import Optional, Tuple, Dict, Any
import numpy as np

class CameraSource(ABC):
    """Abstract base class for all MINEGUARD camera sources.
    Supports ESP32-CAM, synthetic simulator, offline test video,
    and allows future drop-in replacement with real thermal cameras.
    """

    @abstractmethod
    def start(self) -> None:
        """Start receiving frames or generating stream."""
        pass

    @abstractmethod
    def stop(self) -> None:
        """Stop receiving frames and release resources."""
        pass

    @abstractmethod
    def get_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        """Return (success, frame_bgr)."""
        pass

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Return camera source diagnostic metrics (source type, online/offline, fps, resolution, etc.)."""
        pass
