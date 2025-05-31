import WebSocket from 'ws';
import { BotConfig } from '@/types/trading';

class WebSocketBackend {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private subscribeId: number | null = null;
  private config: BotConfig;
  private onStatusChange: (isConnected: boolean) => void;
  private onMessage: (data: any) => void;

  constructor(
    config: BotConfig,
    onStatusChange: (isConnected: boolean) => void,
    onMessage: (data: any) => void
  ) {
    this.config = config;
    this.onStatusChange = onStatusChange;
    this.onMessage = onMessage;
  }

  connect() {
    if (!this.config.coinveraApiKey || !this.config.copyWalletAddress) {
      throw new Error('Missing API key or copy wallet address');
    }

    try {
      // Close existing connection if any
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }

      const wsUrl = this.config.websocket.url || 'wss://api.coinvera.io';
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        this.onStatusChange(true);
        this.subscribeToTrades();
        this.startPingInterval();
      });

      this.ws.on('message', (data: string) => {
        try {
          const parsedData = JSON.parse(data);
          this.onMessage(parsedData);

          // Handle subscription success
          if (parsedData.type === 'subscribeTrade' && parsedData.status === 'success') {
            this.subscribeId = parsedData.subscribeId;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.onStatusChange(false);
        this.stopPingInterval();
      });

      this.ws.on('close', () => {
        this.onStatusChange(false);
        this.stopPingInterval();
      });

      this.ws.on('pong', () => {
        console.log('Pong received');
      });

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.onStatusChange(false);
      throw error;
    }
  }

  private subscribeToTrades() {
    if (!this.ws) return;

    const subscribeMessage = {
      method: 'subscribeTrade',
      apiKey: this.config.coinveraApiKey,
      tokens: [this.config.copyWalletAddress]
    };
    
    this.ws.send(JSON.stringify(subscribeMessage));
  }

  private startPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    const pingInterval = this.config.websocket.pingIntervalMs || 5000;
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, pingInterval);
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  disconnect() {
    if (this.ws) {
      // Unsubscribe if we have a subscribeId
      if (this.subscribeId) {
        const unsubscribeMessage = {
          method: 'unsubscribeTrade',
          apiKey: this.config.coinveraApiKey,
          unsubscribeId: this.subscribeId
        };
        this.ws.send(JSON.stringify(unsubscribeMessage));
        this.subscribeId = null;
      }
      
      this.ws.close();
      this.ws = null;
    }
    this.stopPingInterval();
    this.onStatusChange(false);
  }
}

// Create a singleton instance
let websocketBackend: WebSocketBackend | null = null;

export const getWebSocketBackend = (
  config: BotConfig,
  onStatusChange: (isConnected: boolean) => void,
  onMessage: (data: any) => void
) => {
  if (!websocketBackend) {
    websocketBackend = new WebSocketBackend(config, onStatusChange, onMessage);
  }
  return websocketBackend;
}; 