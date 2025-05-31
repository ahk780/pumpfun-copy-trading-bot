import { useCallback, useRef, useEffect } from 'react';
import { Position, BotConfig, LogEntry } from '@/types/trading';

export const usePriceMonitoring = (
  config: BotConfig,
  positions: Position[],
  setPositions: React.Dispatch<React.SetStateAction<Position[]>>,
  addLog: (level: LogEntry['level'], message: string, data?: any) => void,
  getTokenPrice: (mint: string) => Promise<any>,
  handleSellPosition: (position: Position, reason: string) => void
) => {
  const priceMonitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoggedPositionCount = useRef<number>(-1);
  const lastCheckTime = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);

  const checkPositionPrice = useCallback(async (position: Position) => {
    try {
      console.log('Checking price for position:', position.mint);
      const priceData = await getTokenPrice(position.mint);
      console.log('Price data received:', priceData);
      
      if (!priceData) {
        addLog('warning', `No price data received for ${position.mint}`);
        return;
      }
      
      const currentPriceUsd = priceData.priceInUsd;
      const entryPriceUsd = position.entryPriceUsd;
      
      // Calculate PnL percentage based on entry price
      const pnlPct = ((currentPriceUsd / entryPriceUsd) - 1) * 100;
      
      // Calculate time held for this specific position
      const timeHeld = Date.now() - position.entryTime;
      const timeHeldMinutes = Math.floor(timeHeld / 60000);
      
      // Only log significant price changes or first update
      const priceChanged = Math.abs(currentPriceUsd - position.currentPriceUsd) > 0.000001;
      if (priceChanged || !position.lastUpdated) {
        addLog('success', `Price update for ${position.mint.substring(0, 8)}...${position.mint.substring(position.mint.length - 8)}: $${currentPriceUsd.toFixed(8)} | PnL: ${pnlPct > 0 ? '+' : ''}${pnlPct.toFixed(2)}%`);
      }
      
      // Update position with new current price
      setPositions(prev => prev.map(p => 
        p.mint === position.mint 
          ? { 
              ...p, 
              currentPriceUsd, 
              pnlPct, 
              timeHeld: `${timeHeldMinutes}m`,
              lastUpdated: Date.now()
            }
          : p
      ));
      
      // Check stop loss condition
      if (pnlPct <= -config.stopLossPct) {
        addLog('warning', `🛑 Stop loss triggered for ${position.mint}: ${pnlPct.toFixed(2)}% <= -${config.stopLossPct}%`);
        await handleSellPosition({ ...position, currentPriceUsd, pnlPct }, `Stop Loss (-${config.stopLossPct}%)`);
        return;
      }
      
      // Check take profit condition
      if (pnlPct >= config.takeProfitPct) {
        addLog('success', `🎯 Take profit triggered for ${position.mint}: ${pnlPct.toFixed(2)}% >= ${config.takeProfitPct}%`);
        await handleSellPosition({ ...position, currentPriceUsd, pnlPct }, `Take Profit (+${config.takeProfitPct}%)`);
        return;
      }
      
      // Check timeout condition for this specific position
      if (timeHeld >= config.timeoutMs) {
        addLog('warning', `⏰ Timeout triggered for ${position.mint}: ${timeHeldMinutes}m >= ${config.timeoutMs / 60000}m`);
        await handleSellPosition({ ...position, currentPriceUsd, pnlPct }, `Timeout (${config.timeoutMs / 60000}m)`);
        return;
      }
    } catch (error) {
      console.error('Error checking price:', error);
      addLog('error', `Error checking price for ${position.mint}: ${error}`);
    }
  }, [config, getTokenPrice, handleSellPosition, setPositions, addLog]);

  const monitorPositions = useCallback(async () => {
    // Prevent multiple concurrent price checks
    if (isCheckingRef.current) {
      return;
    }
    isCheckingRef.current = true;

    try {
      if (positions.length === 0) {
        if (lastLoggedPositionCount.current !== 0) {
          addLog('info', 'No positions to monitor');
          lastLoggedPositionCount.current = 0;
        }
        return;
      }
      
      // Update the last logged count
      if (lastLoggedPositionCount.current !== positions.length) {
        addLog('info', `Starting price monitoring for ${positions.length} positions`);
        lastLoggedPositionCount.current = positions.length;
      }
      
      console.log('Starting price check cycle for', positions.length, 'positions');
      
      // Check each position's price
      for (let i = 0; i < positions.length; i++) {
        const position = positions[i];
        console.log(`Checking position ${i + 1}/${positions.length}:`, position.mint);
        
        await checkPositionPrice(position);
        
        // Add delay before checking next position (except for the last one)
        if (i < positions.length - 1) {
          console.log('Waiting', config.priceCheckDelayMs, 'ms before next check');
          await new Promise(resolve => setTimeout(resolve, config.priceCheckDelayMs));
        }
      }
      
      console.log('Completed price check cycle');
    } finally {
      isCheckingRef.current = false;
    }
  }, [positions, config.priceCheckDelayMs, checkPositionPrice, addLog]);

  const startPriceMonitoring = useCallback(() => {
    console.log('Starting price monitoring with interval:', config.priceCheckDelayMs, 'ms');
    
    // Clear any existing interval
    if (priceMonitorIntervalRef.current) {
      clearInterval(priceMonitorIntervalRef.current);
      priceMonitorIntervalRef.current = null;
    }
    
    // Start new interval
    const interval = setInterval(monitorPositions, config.priceCheckDelayMs);
    priceMonitorIntervalRef.current = interval;
    
    // Run first check immediately
    monitorPositions();
    
    addLog('info', `Price monitoring started with ${config.priceCheckDelayMs}ms interval`);
  }, [monitorPositions, config.priceCheckDelayMs, addLog]);

  const stopPriceMonitoring = useCallback(() => {
    if (priceMonitorIntervalRef.current) {
      clearInterval(priceMonitorIntervalRef.current);
      priceMonitorIntervalRef.current = null;
      lastLoggedPositionCount.current = -1; // Reset the counter
      addLog('info', 'Price monitoring stopped');
    }
  }, [addLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (priceMonitorIntervalRef.current) {
        clearInterval(priceMonitorIntervalRef.current);
      }
    };
  }, []);

  return {
    startPriceMonitoring,
    stopPriceMonitoring,
    monitorPositions
  };
};
