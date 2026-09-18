// frontend/src/services/socket.ts
// WebSocket connection manager for live telemetry streaming with auto-reconnection.

type MessageHandler = (event: { type: string; timestamp: string; payload?: unknown }) => void;

class TelemetrySocket {
  private ws: WebSocket | null = null;
  private handlers = new Set<MessageHandler>();
  private reconnectTimer: number | null = null;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const wsUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:5000/ws';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        console.info('[WebSocket] Connected to MINEGUARD Telemetry Server');
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          for (const handler of this.handlers) {
            handler(data);
          }
        } catch {
          // Ignore parse errors
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        if (this.ws) this.ws.close();
      };
    } catch {
      this.isConnected = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  public subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  public send(type: string, payload?: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  public get connected(): boolean {
    return this.isConnected;
  }
}

export const telemetrySocket = new TelemetrySocket();
