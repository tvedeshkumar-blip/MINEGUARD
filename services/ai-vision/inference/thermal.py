import cv2
import numpy as np
from typing import Tuple

class PseudoThermalEngine:
    """Scientific AI Pseudo-Thermal Vision Engine.
    Transforms visible spectrum (RGB/BGR) video feeds into a structural
    pseudo-thermal visualization using luminance extraction, Contrast Limited
    Adaptive Histogram Equalization (CLAHE), bilateral/Gaussian noise suppression,
    and radiometric false-color mapping (e.g. cv2.COLORMAP_INFERNO).

    DISCLAIMER:
    This algorithm maps relative visual intensity / luminance gradients.
    It does NOT measure physical infrared radiation or absolute Celsius temperature.
    """

    COLORMAPS = {
        "INFERNO": cv2.COLORMAP_INFERNO,
        "JET": cv2.COLORMAP_JET,
        "MAGMA": cv2.COLORMAP_MAGMA,
        "PLASMA": cv2.COLORMAP_PLASMA,
        "TURBO": cv2.COLORMAP_TURBO,
        "HOT": cv2.COLORMAP_HOT
    }

    def __init__(self, colormap_name: str = "INFERNO", clip_limit: float = 2.5, tile_grid_size: Tuple[int, int] = (8, 8)):
        self.colormap_id = self.COLORMAPS.get(colormap_name.upper(), cv2.COLORMAP_INFERNO)
        self.colormap_name = colormap_name.upper()
        # Initialize CLAHE for edge-preserving local contrast amplification
        self.clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)

    def set_colormap(self, name: str) -> bool:
        uname = name.upper()
        if uname in self.COLORMAPS:
            self.colormap_name = uname
            self.colormap_id = self.COLORMAPS[uname]
            return True
        return False

    def process_frame(self, bgr_frame: np.ndarray) -> Tuple[np.ndarray, np.ndarray, float]:
        """Convert BGR frame into:
        1. pseudo_thermal_bgr: 3-channel false-color thermal image
        2. normalized_intensity: 1-channel uint8 intensity map [0-255]
        3. peak_intensity_ratio: float [0.0 - 1.0] representing peak scene intensity
        """
        if bgr_frame is None or bgr_frame.size == 0:
            raise ValueError("Invalid input frame provided to PseudoThermalEngine")

        # 1. Luminance extraction via YCrCb (extracting Y channel) or Grayscale
        # Y channel closely mirrors perceived human brightness / radiometric radiance
        ycrcb = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2YCrCb)
        luminance = ycrcb[:, :, 0]

        # 2. Subtle noise reduction to prevent false high-frequency thermal spikes
        denoised = cv2.GaussianBlur(luminance, (3, 3), 0)

        # 3. CLAHE enhancement to bring out subtle contrast gradients in dark tunnels
        enhanced = self.clahe.apply(denoised)

        # 4. Normalize intensity across full 8-bit dynamic range
        normalized = cv2.normalize(enhanced, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)

        # 5. Apply false-color colormap (COLORMAP_INFERNO: black -> purple -> orange -> bright yellow)
        thermal_bgr = cv2.applyColorMap(normalized, self.colormap_id)

        # Compute peak intensity metric [0.0 to 1.0]
        peak_val = float(np.max(normalized)) / 255.0

        return thermal_bgr, normalized, peak_val
