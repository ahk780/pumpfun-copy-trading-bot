
export interface BotConfig {
  solanaRpcUrl: string;
  coinveraApiKey: string;
  privateKey: string;
  walletAddress: string;
  copyWalletAddress: string;
  buyAmount: number;
  jitoTip: number;
  slippage: number;
  stopLossPct: number;
  takeProfitPct: number;
  timeoutMs: number;
  priceCheckDelayMs: number;
  websocket: {
    url: string;
    pingIntervalMs: number;
  };
}

export interface Position {
  mint: string;
  entryPriceSol: number;
  entryPriceUsd: number;
  currentPriceUsd: number;
  entryTime: number;
  solSize: number;
  tokenAmount: number;
  pnlPct: number;
  timeHeld: string;
  signature: string;
  lastUpdated?: number; // For forcing re-renders
}

export interface Trade {
  id: string;
  timestamp: number;
  mint: string;
  dex: string;
  side: 'buy' | 'sell';
  solAmount: number;
  priceInSol: number;
  priceInUsd: number;
  signature?: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}
