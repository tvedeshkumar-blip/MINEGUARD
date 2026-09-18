# MINEGUARD ESP32-CAM AI Pseudo-Thermal Vision Integration Guide

This document details the complete end-to-end setup for streaming live video from an **ESP32-CAM** module to a host PC/laptop, processing the stream with **OpenCV**, **Ultralytics YOLO**, and the **MINEGUARD AI Pseudo-Thermal Vision Engine**, and viewing the telemetry and alerts on the **MINEGUARD Dashboard**.

---

## 1. System Architecture

```text
                     MINEGUARD ROVER
                           │
                           ▼
                    ┌─────────────┐
                    │  ESP32-CAM  │ (OV2640 Sensor)
                    │  RGB Video  │
                    └──────┬──────┘
                           │ Wi-Fi HTTP (MJPEG / JPEG)
                           ▼
                ┌─────────────────────┐
                │ Laptop / Host PC    │
                │ Python AI Vision    │ (FastAPI :8001)
                │ ├── OpenCV Ingest   │
                │ ├── YOLO Detector   │
                │ └── Pseudo-Thermal  │
                └──────────┬──────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
      HTTP MJPEG Stream           WebSocket Metadata
     (/api/vision/stream)         (/ws/vision)
             │                           │
             ▼                           ▼
    MINEGUARD Backend              MINEGUARD Backend
     (Express Proxy)              (Alerts & Relay :5000)
             │                           │
             └─────────────┬─────────────┘
                           ▼
                 MINEGUARD Dashboard
              (React + Vite HUD :5173)
```

---

## 2. Important Scientific Limitation & Disclaimer

> [!IMPORTANT]
> **AI PSEUDO-THERMAL VISION vs TRUE RADIOMETRIC THERMAL IMAGING**:
> The ESP32-CAM uses an **OV2640 CMOS visible-spectrum optical sensor** ($400\text{–}700\text{ nm}$ wavelengths). It **cannot** detect long-wave infrared radiation ($8\text{–}14\text{ }\mu\text{m}$) and **cannot measure physical temperature**.
>
> The MINEGUARD Pseudo-Thermal mode extracts relative luminance gradients, applies Contrast Limited Adaptive Histogram Equalization (CLAHE), and maps the resulting intensity through a false-color scientific gradient (`COLORMAP_INFERNO`).
>
> **The UI and documentation explicitly designate this feature as "AI PSEUDO-THERMAL" or "AI ESTIMATED HEAT VIEW". Never represent RGB-derived values as true Celsius or Fahrenheit degrees.**

---

## 3. ESP32-CAM Hardware & Wiring Setup

### Hardware Requirements
- **ESP32-CAM Module** (e.g. AI-Thinker model with OV2640 camera)
- **FTDI USB-to-UART Serial Adapter** (or ESP32-CAM-MB baseboard)
- **Power Supply**: $5\text{V} / 2\text{A}$ regulated power (ESP32-CAM Wi-Fi radio causes current spikes up to $350\text{–}500\text{mA}$)
- **Jumper Wires**

### Pin Connection for Flashing (FTDI to ESP32-CAM)
| FTDI Pin | ESP32-CAM Pin | Purpose |
| :--- | :--- | :--- |
| **5V / VCC** | **5V** | Power supply (recommended over 3.3V) |
| **GND** | **GND** | Ground reference |
| **TX** | **U0R (GPIO 3)** | Receive serial data |
| **RX** | **U0T (GPIO 1)** | Transmit serial data |
| **GND** | **GPIO 0** | **Connect only during flashing** (enters bootloader mode) |

*Disconnect GPIO 0 from GND and press the RESET button to run the uploaded firmware.*

---

## 4. Minimal Compatible ESP32-CAM Firmware

Flash this minimal Arduino sketch to stream MJPEG over Wi-Fi. It uses the standard AI-Thinker pin definitions and exposes `http://<ESP32_IP>/stream`.

```cpp
#include "esp_camera.h"
#include <WiFi.h>
#include "esp_http_server.h"

// ── Wi-Fi Credentials ──
const char* ssid = "MINEGUARD_ROVER_NET";
const char* password = "SecretPassword123";

// ── AI-Thinker Camera Pin Mapping ──
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define PART_BOUNDARY "123456789000000000000987654321"
static const char* _STREAM_CONTENT_TYPE = "multipart/x-mixed-replace;boundary=" PART_BOUNDARY;
static const char* _STREAM_BOUNDARY = "\r\n--" PART_BOUNDARY "\r\n";
static const char* _STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

httpd_handle_t stream_httpd = NULL;

static esp_err_t stream_handler(httpd_req_t *req) {
    camera_fb_t * fb = NULL;
    esp_err_t res = ESP_OK;
    size_t _jpg_buf_len = 0;
    uint8_t * _jpg_buf = NULL;
    char part_buf[64];

    res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
    if (res != ESP_OK) return res;

    while (true) {
        fb = esp_camera_fb_get();
        if (!fb) {
            res = ESP_FAIL;
        } else {
            _jpg_buf_len = fb->len;
            _jpg_buf = fb->buf;
        }

        if (res == ESP_OK) {
            res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen(_STREAM_BOUNDARY));
        }
        if (res == ESP_OK) {
            size_t hlen = snprintf(part_buf, 64, _STREAM_PART, _jpg_buf_len);
            res = httpd_resp_send_chunk(req, part_buf, hlen);
        }
        if (res == ESP_OK) {
            res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
        }

        if (fb) {
            esp_camera_fb_return(fb);
            fb = NULL;
            _jpg_buf = NULL;
        } else if (_jpg_buf) {
            free(_jpg_buf);
            _jpg_buf = NULL;
        }

        if (res != ESP_OK) break;
    }
    return res;
}

void startCameraServer() {
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    config.server_port = 80;

    httpd_uri_t stream_uri = {
        .uri       = "/stream",
        .method    = HTTP_GET,
        .handler   = stream_handler,
        .user_ctx  = NULL
    };

    if (httpd_start(&stream_httpd, &config) == ESP_OK) {
        httpd_register_uri_handler(stream_httpd, &stream_uri);
    }
}

void setup() {
    Serial.begin(115200);
    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_siod = SIOD_GPIO_NUM;
    config.pin_sioc = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_JPEG;

    // Frame size: VGA (640x480) optimal for Wi-Fi throughput
    config.frame_size = FRAMESIZE_VGA;
    config.jpeg_quality = 12;
    config.fb_count = 2;

    esp_camera_init(&config);

    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.print("[ESP32] Stream ready at: http://");
    Serial.print(WiFi.localIP());
    Serial.println("/stream");

    startCameraServer();
}

void loop() {
    delay(1000);
}
```

---

## 5. Finding the ESP32-CAM IP Address

1. Open the Arduino Serial Monitor at **115200 baud**.
2. Press the onboard **RST** button on the ESP32-CAM.
3. Observe the boot log:
   ```text
   WiFi connected
   [ESP32] Stream ready at: http://192.168.1.145/stream
   ```
4. Verify reachability by opening `http://192.168.1.145/stream` in your desktop web browser.

---

## 6. Starting All MINEGUARD Services

### Step A: Start the Python AI Vision Service (Port 8001)

```powershell
cd d:\MINEGUARD\services\ai-vision
.\.venv\Scripts\activate
python -m uvicorn app:app --host 0.0.0.0 --port 8001
```

### Step B: Start the MINEGUARD Backend (Port 5000)

```powershell
cd d:\MINEGUARD\backend
npm run dev
```

### Step C: Start the MINEGUARD Frontend (Port 5173)

```powershell
cd d:\MINEGUARD\frontend
npm run dev
```

---

## 7. Configuring the Camera via the Dashboard

1. Open the MINEGUARD Dashboard in your browser: [http://localhost:5173](http://localhost:5173)
2. In the sidebar, select **Rover Camera**.
3. In the upper banner, click **Configure Camera / ESP32**.
4. In the configuration modal:
   - **Camera Feed Source**: Select `ESP32-CAM Wi-Fi Module` (or `Synthetic Simulator` when developing offline).
   - **ESP32-CAM Base URL**: Enter your device IP, e.g. `http://192.168.1.145`.
   - **Stream Endpoint**: Enter `/stream`.
   - Click **Test Connection**: The system immediately tests HTTP reachability without disturbing ongoing workflows.
   - Adjust **YOLO Object Detection Confidence** (default: $40\%$).
   - Choose your preferred false-color gradient (Inferno, Turbo, Magma, Plasma, Jet).
   - Adjust **Thermal Hotspot Anomaly Sensitivity** (default: $80\%$).
   - Click **Apply Changes**.

---

## 8. Dashboard Vision Modes

The HUD supports 5 selectable optics and processing modes:

| Mode | Visual Representation | Pipeline Description |
| :--- | :--- | :--- |
| **Standard RGB** | Visible optical frame | Direct uncompressed RGB optical feed. |
| **IR Night Vision** | Green-phosphor boost | Digital luminance amplification with contrast equalization and scanlines. |
| **AI Vision (HUD)** | RGB + YOLO boxes | Pretrained object detection with confidence metrics and mining hazard labels (`PERSON`, `VEHICLE`, etc.). |
| **Pseudo-Thermal** | Inferno False-Color | Luminance extraction $\to$ Gaussian filtering $\to$ CLAHE contrast enhancement $\to$ `COLORMAP_INFERNO`. |
| **Thermal + AI** | Dual Anomaly HUD | Pseudo-thermal heatmap $\mathbf{+}$ YOLO detection boxes $\mathbf{+}$ Hotspot contour callouts with severity ratings. |

---

## 9. Automated Alert Integration & Debouncing

When hazardous anomalies are observed in the video feed, the system automatically triggers MINEGUARD incidents:
1. **Critical Thermal Hotspot**: High relative intensity cluster ($\ge 88\%$) triggers a `danger` severity alert:
   > *"CRITICAL: High visual heat anomaly detected at intensity 94% (AI Pseudo-Thermal)"*
2. **Personnel Hazard Drift Detection**: High-confidence human detection ($\ge 65\%$) in active extraction tunnels generates an alert:
   > *"WARNING: Personnel detected in forward rover zone (AI YOLO Confidence: 94%)"*
3. **Alert Debouncing**: Debounce cooldown timer (`10 seconds`) prevents continuous alert spam for persistent objects.
4. **Audit Trail**: Events are persisted to the SQLite `vision_events` table with bounding boxes, confidence, and timestamps.

---

## 10. Future Upgrade Path: Real Radiometric Thermal Cameras

The MINEGUARD camera abstraction allows plugging in real thermographic sensors (e.g. **FLIR Lepton 3.5**, **MLX90640**, or **Seek Thermal**) without modifying the frontend:
1. Create `camera/flir_thermal_client.py` implementing `CameraSource`.
2. Map true 16-bit raw Kelvin radiometric arrays to absolute temperature matrices.
3. Update the `CameraSourceType` enum to include `future_thermal`.
4. In this future mode, calibrated Celsius degrees can replace the relative intensity indices.
