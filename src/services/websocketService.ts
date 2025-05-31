import WebSocket from 'ws';
import { BotConfig } from '@/types/trading';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private subscribeId: number | null = null;
  private config: BotConfig;
  private onMessage: (data: any) => void;
  private onError: (error: any) => void;
  private onClose: (code: number, reason: string) => void;

  constructor(
    config: BotConfig,
    onMessage: (data: any) => void,
    onError: (error: any) => void,
    onClose: (code: number, reason: string) => void
  ) {
    this.config = config;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onClose = onClose;
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
        this.onError(error);
        this.stopPingInterval();
      });

      this.ws.on('close', (code, reason) => {
        this.onClose(code, reason.toString());
        this.stopPingInterval();
      });

      this.ws.on('pong', () => {
        console.log('Pong received');
      });

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
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
  }
} 