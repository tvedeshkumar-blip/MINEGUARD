// backend/src/ws/socketHandler.ts
import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'node:http';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function initWebSocketServer(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);

    // Send initial welcome & connection ack
    ws.send(JSON.stringify({
      type: 'CONNECTION_ESTABLISHED',
      timestamp: new Date().toISOString(),
      message: 'MINEGUARD Real-time Telemetry WebSocket connected'
    }));

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
        }
      } catch {
        // ignore non-json messages
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', () => {
      clients.delete(ws);
    });
  });

  return wss;
}

export function broadcastEvent(eventType: string, payload: unknown) {
  if (!wss) return;
  const message = JSON.stringify({
    type: eventType,
    timestamp: new Date().toISOString(),
    payload
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}
