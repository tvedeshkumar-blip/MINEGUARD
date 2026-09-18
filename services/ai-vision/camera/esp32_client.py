import time
import threading
import logging
import urllib.request
import urllib.error
from typing import Optional, Tuple, Dict, Any
import cv2
import numpy as np

from .camera_source import CameraSource

logger = logging.getLogger("mineguard.camera.esp32")

class ESP32CamClient(CameraSource):
    """Robust client for streaming frames from an ESP32-CAM module.
    Supports MJPEG multipart HTTP stream and single-JPEG polling.
    Includes connection timeout, auto-reconnect, FPS calculation,
    and graceful error state reporting.
    """

    def __init__(self, base_url: str, endpoint: str = "/stream", 
                 connect_timeout: float = 4.0, read_timeout: float = 6.0):
        self.base_url = base_url.rstrip("/")
        self.endpoint = "/" + endpoint.lstrip("/")
        self.connect_timeout = connect_timeout
        self.read_timeout = read_timeout

        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.Lock()

        self._latest_frame: Optional[np.ndarray] = None
        self._last_frame_time: float = 0.0
        self._status: str = "OFFLINE"  # "ONLINE", "CONNECTING", "OFFLINE"
        self._error_msg: Optional[str] = None
        self._resolution: Tuple[int, int] = (0, 0)
        self._fps: float = 0.0
        self._fps_counter: int = 0
        self._fps_last_calc: float = time.time()
        self._reconnect_delay: float = 2.0

    @property
    def stream_url(self) -> str:
        return f"{self.base_url}{self.endpoint}"

    def update_config(self, base_url: Optional[str] = None, endpoint: Optional[str] = None):
        """Dynamically update URL and endpoint without service restart."""
        with self._lock:
            need_restart = False
            if base_url and base_url.rstrip("/") != self.base_url:
                self.base_url = base_url.rstrip("/")
                need_restart = True
            if endpoint and ("/" + endpoint.lstrip("/")) != self.endpoint:
                self.endpoint = "/" + endpoint.lstrip("/")
                need_restart = True
        
        if need_restart and self._running:
            logger.info(f"[ESP32] Config updated to {self.stream_url}. Restarting stream worker...")
            self.stop()
            self.start()

    def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._status = "CONNECTING"
        self._thread = threading.Thread(target=self._stream_loop, daemon=True, name="ESP32CamStreamer")
        self._thread.start()
        logger.info(f"[ESP32] Worker started targeting {self.stream_url}")

    def stop(self) -> None:
        self._running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)
        with self._lock:
            self._status = "OFFLINE"
            self._latest_frame = None
        logger.info("[ESP32] Worker stopped")

    def get_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        with self._lock:
            if self._latest_frame is not None:
                return True, self._latest_frame.copy()
            return False, None

    def get_status(self) -> Dict[str, Any]:
        with self._lock:
            # If no frame received in past 4 seconds while online, mark connecting/offline
            is_stale = (time.time() - self._last_frame_time > 4.0) if self._last_frame_time > 0 else True
            effective_status = self._status
            if self._status == "ONLINE" and is_stale:
                effective_status = "CONNECTING"

            return {
                "source": "esp32",
                "status": effective_status,
                "stream_url": self.stream_url,
                "fps": round(self._fps, 1),
                "resolution": f"{self._resolution[0]}x{self._resolution[1]}" if self._resolution[0] > 0 else "0x0",
                "last_frame_sec_ago": round(time.time() - self._last_frame_time, 1) if self._last_frame_time > 0 else None,
                "error": self._error_msg
            }

    def _stream_loop(self) -> None:
        """Main loop that continuously handles connections and stream decoding."""
        while self._running:
            try:
                with self._lock:
                    self._status = "CONNECTING"
                    self._error_msg = None
                
                logger.info(f"[ESP32] Connecting to {self.stream_url}...")
                req = urllib.request.Request(
                    self.stream_url,
                    headers={"User-Agent": "MINEGUARD-Vision-Client/1.0"}
                )

                response = urllib.request.urlopen(req, timeout=self.connect_timeout)
                content_type = response.headers.get("Content-Type", "")

                if "multipart/x-mixed-replace" in content_type:
                    self._read_mjpeg(response)
                else:
                    # Single JPEG or direct byte stream fallback
                    self._read_single_jpeg_fallback(response)

            except (urllib.error.URLError, TimeoutError, OSError) as e:
                with self._lock:
                    self._status = "OFFLINE"
                    self._error_msg = f"Connection error: {str(e)}"
                logger.warning(f"[ESP32] Connection failed: {e}. Retrying in {self._reconnect_delay}s...")
                time.sleep(self._reconnect_delay)
            except Exception as e:
                with self._lock:
                    self._status = "OFFLINE"
                    self._error_msg = f"Unexpected error: {str(e)}"
                logger.error(f"[ESP32] Unexpected error: {e}", exc_info=True)
                time.sleep(self._reconnect_delay)

    def _read_mjpeg(self, stream) -> None:
        """Parse multipart MJPEG stream boundary chunks."""
        bytes_buffer = bytearray()
        logger.info("[ESP32] Stream connected (MJPEG). Ingesting frames...")

        while self._running:
            chunk = stream.read(4096)
            if not chunk:
                break
            bytes_buffer.extend(chunk)

            # Look for JPEG boundary markers (SOI = \xff\xd8, EOI = \xff\xd9)
            a = bytes_buffer.find(b'\xff\xd8')
            b = bytes_buffer.find(b'\xff\xd9')

            if a != -1 and b != -1 and b > a:
                jpg_data = bytes_buffer[a:b+2]
                bytes_buffer = bytes_buffer[b+2:]

                self._process_raw_jpeg(jpg_data)

    def _read_single_jpeg_fallback(self, stream) -> None:
        """Handle single-capture endpoints by reading full JPEG and re-polling."""
        jpg_data = stream.read()
        if jpg_data:
            self._process_raw_jpeg(jpg_data)
        time.sleep(0.1)

    def _process_raw_jpeg(self, jpg_data: bytes) -> None:
        """Decode JPEG bytes and update internal buffer and metrics."""
        np_arr = np.frombuffer(jpg_data, dtype=np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is not None and frame.size > 0:
            now = time.time()
            with self._lock:
                self._latest_frame = frame
                self._last_frame_time = now
                self._status = "ONLINE"
                self._resolution = (frame.shape[1], frame.shape[0])
                self._error_msg = None

                # Calculate smoothed FPS
                self._fps_counter += 1
                elapsed = now - self._fps_last_calc
                if elapsed >= 1.0:
                    self._fps = self._fps_counter / elapsed
                    self._fps_counter = 0
                    self._fps_last_calc = now
