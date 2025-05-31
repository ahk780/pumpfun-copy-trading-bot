import { useCallback } from 'react';
import { Position, Trade, BotConfig, LogEntry } from '@/types/trading';
import { useTradingService } from './useTradingService';

interface UseTradingOperationsProps {
  config: BotConfig;
  addLog: (level: LogEntry['level'], message: string, data?: any) => void;
  setPositions: React.Dispatch<React.SetStateAction<Position[]>>;
  setTrades: React.Dispatch<React.SetStateAction<Trade[]>>;
}

export const useTradingOperations = ({
  config,
  addLog,
  setPositions,
  setTrades
}: UseTradingOperationsProps) => {
  const { getTokenPrice, executeOrder, getActualTokenBalance } = useTradingService(config, addLog);

  const handleSellPosition = useCallback(async (position: Position, reason: string) => {
    addLog('info', `Selling position ${position.mint} due to: ${reason}`);
    
    // Get actual token balance before selling
    const actualBalance = await getActualTokenBalance(position.mint);
    
    if (!actualBalance || actualBalance <= 0) {
      addLog('error', `No tokens available to sell for ${position.mint}. Removing position.`);
      setPositions(prev => prev.filter(p => p.mint !== position.mint));
      return;
    }
    
    // Sell 100% of tokens since fees are paid in SOL
    const sellAmount = actualBalance;
    
    // Round to 6 decimal places to avoid precision issues
    const roundedSellAmount = Math.floor(sellAmount * 1000000) / 1000000;
    
    addLog('info', `Using actual token balance: ${actualBalance}, selling: ${roundedSellAmount}`);
    
    const signature = await executeOrder(position.mint, 'sell', roundedSellAmount);
    
    if (signature) {
      setPositions(prev => prev.filter(p => p.mint !== position.mint));
      
      const sellTrade: Trade = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        mint: position.mint,
        dex: 'Pump.fun',
        side: 'sell',
        solAmount: position.solSize * (1 + position.pnlPct / 100),
        priceInSol: position.currentPriceUsd / position.entryPriceUsd * position.entryPriceSol,
        priceInUsd: position.currentPriceUsd,
        signature
      };
      
      setTrades(prev => [sellTrade, ...prev].slice(0, 20));
      addLog('success', `Position closed: ${position.mint} - ${reason} - PnL: ${position.pnlPct.toFixed(2)}%`);
    } else {
      addLog('error', `Failed to sell position ${position.mint} - sell order was not executed`);
    }
  }, [addLog, executeOrder, getActualTokenBalance, setPositions, setTrades]);

  const handleBuySignal = useCallback(async (mint: string, priceInSol: number, solAmount: number, seenBuys: Set<string>, setSeenBuys: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    if (seenBuys.has(mint)) {
      addLog('warning', `Already processed buy for ${mint}, skipping`);
      return;
    }

    setSeenBuys(prev => new Set(prev).add(mint));
    
    addLog('info', `Processing buy signal for ${mint}`);
    
    const signature = await executeOrder(mint, 'buy', config.buyAmount);
    
    if (signature) {
      addLog('info', `Buy order successful with signature: ${signature}`);
      
      // Get current price data after the buy
      const priceData = await getTokenPrice(mint);
      addLog('info', `Price data received:`, priceData);
      
      // Ensure we have valid price data, fallback to estimated values if needed
      const currentPriceUsd = priceData?.priceInUsd || 0;
      const entryPriceUsd = currentPriceUsd || (priceInSol * 150); // Rough SOL to USD conversion as fallback
      
      const estimatedTokenAmount = config.buyAmount / priceInSol;
      
      const newPosition: Position = {
        mint,
        entryPriceSol: priceInSol,
        entryPriceUsd: entryPriceUsd,
        currentPriceUsd: currentPriceUsd,
        entryTime: Date.now(),
        solSize: config.buyAmount,
        tokenAmount: estimatedTokenAmount,
        pnlPct: 0,
        timeHeld: '0m',
        signature
      };
      
      addLog('info', `Created position with entry price USD: $${entryPriceUsd.toFixed(6)}, current price USD: $${currentPriceUsd.toFixed(6)}`);
      
      // Update positions: remove any existing position for this mint and add the new one
      setPositions(prev => {
        // Filter out any existing position for this mint
        const otherPositions = prev.filter(p => p.mint !== mint);
        // Add the new position
        return [...otherPositions, newPosition];
      });
      
      const newTrade: Trade = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        mint,
        dex: 'Pump.fun',
        side: 'buy',
        solAmount: config.buyAmount,
        priceInSol,
        priceInUsd: entryPriceUsd,
        signature
      };
      
      setTrades(prev => [newTrade, ...prev].slice(0, 20));
      addLog('success', `Position opened for ${mint} with ${config.buyAmount} SOL`);
    } else {
      addLog('error', `Buy order failed for ${mint} - no position created`);
    }
  }, [addLog, executeOrder, config.buyAmount, getTokenPrice, setPositions, setTrades]);

  return {
    handleSellPosition,
    handleBuySignal,
    getTokenPrice
  };
};
