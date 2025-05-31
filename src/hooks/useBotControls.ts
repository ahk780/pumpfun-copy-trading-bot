import { useCallback, useEffect, useRef } from 'react';
import { BotConfig, Position, LogEntry } from '@/types/trading';
import { useWebSocketService } from './useWebSocketService';
import { usePriceMonitoring } from './usePriceMonitoring';

interface UseBotControlsProps {
  config: BotConfig;
  isBotRunning: boolean;
  setIsBotRunning: (running: boolean) => void;
  positions: Position[];
  setPositions: React.Dispatch<React.SetStateAction<Position[]>>;
  addLog: (level: LogEntry['level'], message: string, data?: any) => void;
  setIsConnected: (connected: boolean) => void;
  setSeenBuys: React.Dispatch<React.SetStateAction<Set<string>>>;
  handleBuySignal: (mint: string, priceInSol: number, solAmount: number, seenBuys: Set<string>, setSeenBuys: React.Dispatch<React.SetStateAction<Set<string>>>) => void;
  handleSellPosition: (position: Position, reason: string) => void;
  getTokenPrice: (mint: string) => Promise<any>;
  seenBuys: Set<string>;
}

export const useBotControls = ({
  config,
  isBotRunning,
  setIsBotRunning,
  positions,
  setPositions,
  addLog,
  setIsConnected,
  setSeenBuys,
  handleBuySignal,
  handleSellPosition,
  getTokenPrice,
  seenBuys
}: UseBotControlsProps) => {
  const wrappedHandleBuySignal = useCallback((mint: string, priceInSol: number, solAmount: number) => {
    handleBuySignal(mint, priceInSol, solAmount, seenBuys, setSeenBuys);
  }, [handleBuySignal, seenBuys, setSeenBuys]);

  const { connectToWebSocket, disconnectWebSocket } = useWebSocketService({
    config,
    addLog,
    onBuySignal: wrappedHandleBuySignal,
    setIsConnected,
    isBotRunning,
    positions
  });

  const { startPriceMonitoring, stopPriceMonitoring, monitorPositions } = usePriceMonitoring(
    config,
    positions,
    setPositions,
    addLog,
    getTokenPrice,
    handleSellPosition
  );

  // Keep track of the monitoring interval
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartBot = useCallback(() => {
    if (!config.coinveraApiKey || !config.copyWalletAddress || !config.buyAmount || !config.privateKey || !config.walletAddress) {
      addLog('error', 'Please configure all required fields: API key, private key, wallet address, copy wallet address, and buy amount');
      return;
    }
    
    setIsBotRunning(true);
    setSeenBuys(new Set());
    addLog('info', `Bot started - monitoring copy wallet ${config.copyWalletAddress} for buy signals with ${config.buyAmount} SOL per trade`);
    addLog('info', `Using wallet address: ${config.walletAddress} for trading`);
    addLog('info', `Risk management: Stop Loss: ${config.stopLossPct}%, Take Profit: ${config.takeProfitPct}%, Timeout: ${config.timeoutMs / 60000}m`);
    addLog('info', `Price monitoring: Check delay: ${config.priceCheckDelayMs}ms`);
    
    connectToWebSocket();
    startPriceMonitoring();
  }, [config, addLog, connectToWebSocket, startPriceMonitoring, setIsBotRunning, setSeenBuys]);

  const handleStopBot = useCallback(() => {
    setIsBotRunning(false);
    disconnectWebSocket();
    stopPriceMonitoring();
    addLog('warning', 'Bot stopped');
  }, [disconnectWebSocket, stopPriceMonitoring, addLog, setIsBotRunning]);

  const handleForceSell = useCallback((mint: string) => {
    const position = positions.find(p => p.mint === mint);
    if (position) {
      handleSellPosition(position, 'Manual Force Sell');
    }
  }, [positions, handleSellPosition]);

  // Effect to handle price monitoring when positions change
  useEffect(() => {
    console.log('Positions changed:', positions.length, 'positions');
    
    // Clear existing interval
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }

    // If we have positions and bot is running, start monitoring
    if (positions.length > 0 && isBotRunning) {
      console.log('Starting price monitoring interval with delay:', config.priceCheckDelayMs);
      
      // Start the interval
      monitoringIntervalRef.current = setInterval(() => {
        console.log('Running price check cycle...');
        monitorPositions();
      }, config.priceCheckDelayMs);
      
      // Run first check immediately
      monitorPositions();
    }

    // Cleanup
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
        monitoringIntervalRef.current = null;
      }
    };
  }, [positions.length, isBotRunning, config.priceCheckDelayMs, monitorPositions]);

  return {
    handleStartBot,
    handleStopBot,
    handleForceSell
  };
};
