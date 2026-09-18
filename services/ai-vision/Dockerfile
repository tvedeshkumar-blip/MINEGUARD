# services/ai-vision/Dockerfile
FROM python:3.11-slim

# Install system dependencies required by OpenCV and HTTP clients
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose Vision Service port
EXPOSE 8001

# Default environment variables
ENV PYTHONUNBUFFERED=1 \
    VISION_HOST=0.0.0.0 \
    VISION_PORT=8001 \
    CAMERA_SOURCE=simulator \
    AI_DEVICE=cpu

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8001/api/vision/health || exit 1

CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
