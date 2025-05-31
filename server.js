import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import WebSocket from 'ws';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Enable CORS
app.use(cors());

// Store active connections
const connections = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      // Handle connection request
      if (data.type === 'connect') {
        const { config } = data;
        
        // Create connection to Coinvera
        const coinveraWs = new WebSocket(config.websocket.url || 'wss://api.coinvera.io');
        
        // Store connection info
        connections.set(ws, { 
          config,
          coinveraWs
        });

        // Handle Coinvera WebSocket events
        coinveraWs.on('open', () => {
          // Subscribe to trades
          const subscribeMessage = {
            method: 'subscribeTrade',
            apiKey: config.coinveraApiKey,
            tokens: [config.copyWalletAddress]
          };
          coinveraWs.send(JSON.stringify(subscribeMessage));

          // Start ping interval
          const pingInterval = setInterval(() => {
            if (coinveraWs.readyState === WebSocket.OPEN) {
              coinveraWs.ping();
            }
          }, config.websocket.pingIntervalMs || 5000);

          // Store ping interval
          connections.get(ws).pingInterval = pingInterval;

          // Notify client
          ws.send(JSON.stringify({ type: 'connected' }));
        });

        coinveraWs.on('message', (data) => {
          // Forward messages to client
          ws.send(data.toString());
        });

        coinveraWs.on('error', (error) => {
          console.error('Coinvera WebSocket error:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Coinvera connection error' }));
        });

        coinveraWs.on('close', () => {
          ws.send(JSON.stringify({ type: 'disconnected' }));
        });

        coinveraWs.on('pong', () => {
          console.log('Pong received from Coinvera');
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    const connection = connections.get(ws);
    if (connection) {
      // Clear ping interval
      if (connection.pingInterval) {
        clearInterval(connection.pingInterval);
      }
      // Close Coinvera connection
      if (connection.coinveraWs) {
        connection.coinveraWs.close();
      }
    }
    connections.delete(ws);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 