
import { useState, useCallback } from 'react';
import { BotConfig, Position, Trade, LogEntry } from '@/types/trading';

export const useTradingState = () => {
  const getInitialConfig = (): BotConfig => {
    try {
      const saved = localStorage.getItem('tradingBotConfig');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load saved config:', error);
    }
    
    return {
      solanaRpcUrl: 'https://api.mainnet-beta.solana.com',
      coinveraApiKey: '',
      privateKey: '',
      walletAddress: '',
      copyWalletAddress: '',
      buyAmount: 0.1,
      jitoTip: 0.0005,
      slippage: 20,
      stopLossPct: 5,
      takeProfitPct: 10,
      timeoutMs: 3600000,
      priceCheckDelayMs: 2000,
      websocket: {
        url: 'wss://api.coinvera.io',
        pingIntervalMs: 10000
      }
    };
  };

  const [config, setConfig] = useState<BotConfig>(getInitialConfig);
  const [isConnected, setIsConnected] = useState(false);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [seenBuys, setSeenBuys] = useState<Set<string>>(new Set());

  const addLog = useCallback((level: LogEntry['level'], message: string, data?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      level,
      message,
      data
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
    console.log(`[${level.toUpperCase()}] ${message}`, data || '');
  }, []);

  const handleClearHistory = useCallback(() => {
    setLogs([]);
    setTrades([]);
    setPositions([]);
    addLog('info', 'History and positions cleared');
  }, [addLog]);

  return {
    config,
    setConfig,
    isConnected,
    setIsConnected,
    isBotRunning,
    setIsBotRunning,
    positions,
    setPositions,
    trades,
    setTrades,
    logs,
    seenBuys,
    setSeenBuys,
    addLog,
    handleClearHistory
  };
};
