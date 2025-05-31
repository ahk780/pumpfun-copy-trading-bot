import { useCallback, useRef, useEffect } from 'react';
import { BotConfig, LogEntry, Position } from '@/types/trading';

interface UseWebSocketServiceProps {
  config: BotConfig;
  addLog: (level: LogEntry['level'], message: string, data?: any) => void;
  onBuySignal: (mint: string, priceInSol: number, solAmount: number) => void;
  setIsConnected: (connected: boolean) => void;
  isBotRunning: boolean;
  positions: Position[];
}

export const useWebSocketService = ({
  config,
  addLog,
  onBuySignal,
  setIsConnected,
  isBotRunning,
  positions
}: UseWebSocketServiceProps) => {
  const websocketRef = useRef<WebSocket | null>(null);

  const connectToWebSocket = useCallback(() => {
    if (!config.coinveraApiKey || !config.copyWalletAddress) {
      addLog('error', 'Missing API key or copy wallet address');
      return;
    }

    try {
      // Close existing connection if any
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }

      // Connect to our backend server
      const wsUrl = 'ws://localhost:3001';
      addLog('info', `Attempting to connect to WebSocket at ${wsUrl}...`);
      
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;
      
      ws.onopen = () => {
        // Send configuration to backend
        ws.send(JSON.stringify({
          type: 'connect',
          config: {
            coinveraApiKey: config.coinveraApiKey,
            copyWalletAddress: config.copyWalletAddress,
            websocket: config.websocket
          }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          // Handle connection confirmation
          if (data.type === 'connected') {
            setIsConnected(true);
            addLog('success', 'Connected to Coinvera WebSocket');
            return;
          }
          
          // Handle trade data
          if (data.trade === 'buy' && 
              data.dexs && 
              Array.isArray(data.dexs) &&
              ['Pump.fun', 'Pump.fun Amm'].includes(data.dexs[0]) &&
              data.ca && 
              data.priceInSol &&
              data.solAmount) {
            
            // Check if we already have an open position for this mint
            const existingPosition = positions.find(p => p.mint === data.ca);
            if (existingPosition) {
              addLog('warning', `Skipping buy signal for ${data.ca} - already have an open position`);
              return;
            }
            
            addLog('info', `Buy signal detected from copy wallet: ${data.ca} on ${data.dexs[0]}`);
            addLog('info', `Price in SOL: ${data.priceInSol}, SOL Amount: ${Math.abs(data.solAmount)}`);
            
            onBuySignal(data.ca, data.priceInSol, Math.abs(data.solAmount));
          } else {
            if (data.trade && data.dexs) {
              addLog('info', `Skipping trade: ${data.trade} on ${data.dexs[0]} for ${data.ca || 'unknown'}`);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          addLog('error', `Error parsing WebSocket message: ${error}`);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        addLog('error', 'WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        addLog('warning', 'Disconnected from Coinvera WebSocket');
      };
      
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      addLog('error', `Failed to connect to WebSocket: ${error}`);
      setIsConnected(false);
    }
  }, [config, addLog, onBuySignal, setIsConnected, isBotRunning, positions]);

  const disconnectWebSocket = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    setIsConnected(false);
  }, [setIsConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  return {
    connectToWebSocket,
    disconnectWebSocket
  };
};
