import cv2
import numpy as np
from typing import List, Dict, Any

class HotspotDetector:
    """Relative Visual Intensity Hotspot Detector.
    Identifies localized high-intensity thermal anomalies in camera frames
    using adaptive thresholding, morphological filtering, and contour geometry analysis.
    """

    def __init__(self, threshold_ratio: float = 0.80, min_area: int = 120):
        self.threshold_ratio = threshold_ratio  # 0.0 to 1.0 (e.g., top 20% intensity)
        self.min_area = min_area
        self.kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))

    def detect_hotspots(self, normalized_intensity: np.ndarray) -> List[Dict[str, Any]]:
        """Find hotspots on normalized 8-bit intensity map.
        Returns list of structured hotspot dictionaries.
        """
        if normalized_intensity is None or normalized_intensity.size == 0:
            return []

        # 1. Binarize at threshold
        threshold_val = int(self.threshold_ratio * 255.0)
        _, binary = cv2.threshold(normalized_intensity, threshold_val, 255, cv2.THRESH_BINARY)

        # 2. Morphological Operations: Close to consolidate clusters, Open to remove speckles
        closed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, self.kernel)
        opened = cv2.morphologyEx(closed, cv2.MORPH_OPEN, self.kernel)

        # 3. Find connected contours
        contours, _ = cv2.findContours(opened, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        hotspots: List[Dict[str, Any]] = []

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < self.min_area:
                continue

            x, y, w, h = cv2.boundingRect(cnt)
            
            # Extract ROI on original intensity to compute peak and mean intensity
            roi = normalized_intensity[y:y+h, x:x+w]
            peak_intensity = float(np.max(roi)) / 255.0
            mean_intensity = float(np.mean(roi)) / 255.0

            # Determine severity based on intensity score and area
            if peak_intensity >= 0.95 or area > 1500:
                severity = "CRITICAL"
            elif peak_intensity >= 0.88 or area > 800:
                severity = "HIGH"
            elif peak_intensity >= 0.82:
                severity = "MEDIUM"
            else:
                severity = "LOW"

            hotspots.append({
                "x": int(x),
                "y": int(y),
                "width": int(w),
                "height": int(h),
                "area": int(area),
                "intensity": round(peak_intensity, 2),
                "mean_intensity": round(mean_intensity, 2),
                "severity": severity
            })

        # Sort hotspots by intensity descending
        hotspots.sort(key=lambda h: h["intensity"], reverse=True)
        return hotspots
