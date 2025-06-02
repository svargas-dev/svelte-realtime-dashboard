import { Server } from "socket.io";
import type { Server as HttpServer } from 'http';

const log = (message: string, ...args: any[]) => {
  console.log(`[WebSocket] ${message}`, ...args);
};

export const webSocketServer = {
  name: "webSocketServer",
  configureServer(server: { httpServer: HttpServer }) {
    const io = new Server(server.httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-domain.com' 
          : ['http://localhost:5173', 'http://127.0.0.1:5173'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      // Disable source map support to prevent 404 errors
      allowEIO3: true
    });
    
    log("WebSocket server starting...");

    // Handle 404 for source map requests
    server.httpServer?.on('request', (req, res) => {
      if (req.url?.includes('.map')) {
        res.writeHead(404);
        res.end();
        return;
      }
    });

    io.on("connection", (socket) => {
      log(`New connection from ${socket.id}`, { 
        ip: socket.handshake.address,
        headers: socket.handshake.headers,
        time: new Date().toISOString() 
      });

      // Log incoming messages
      socket.onAny((event, ...args) => {
        log(`Received '${event}' from ${socket.id}`, args);
      });

      // Handle disconnection
      socket.on("disconnect", (reason) => {
        log(`Client ${socket.id} disconnected`, { 
          reason,
          time: new Date().toISOString() 
        });
      });

      // Handle errors
      socket.on("error", (error) => {
        console.error(`WebSocket error from ${socket.id}:`, error);
      });
    });

    log("WebSocket server ready");
  },
};
