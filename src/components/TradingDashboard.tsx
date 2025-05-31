import React from 'react';
import { ConfigPanel } from './ConfigPanel';
import { LiveFeed } from './LiveFeed';
import { PositionsTable } from './PositionsTable';
import { LogsPanel } from './LogsPanel';
import { BotControls } from './BotControls';
import { StatusIndicator } from './StatusIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTradingState } from '@/hooks/useTradingState';
import { useTradingOperations } from '@/hooks/useTradingOperations';
import { useBotControls } from '@/hooks/useBotControls';

export const TradingDashboard: React.FC = () => {
  const {
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
  } = useTradingState();

  const { handleSellPosition, handleBuySignal, getTokenPrice } = useTradingOperations({
    config,
    addLog,
    setPositions,
    setTrades
  });

  const { handleStartBot, handleStopBot, handleForceSell } = useBotControls({
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
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Pumpfun Copy Trading Bot</h1>
            <div className="max-w-2xl">
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                A secure and efficient copy trading bot for Pump.fun. Monitor and replicate trades from any wallet using CoinVera's real-time data and SolanaPortal's execution engine.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              <a 
                href="https://github.com/ahk780/pumpfu-copy-trading-bot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Github
              </a>
              <span className="text-gray-600">|</span>
              <a 
                href="https://coinvera.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                CoinVera API
              </a>
              <span className="text-gray-600">|</span>
              <a 
                href="https://docs.solanaportal.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                SolanaPortal API
              </a>
            </div>
          </div>
          <StatusIndicator isConnected={isConnected} isBotRunning={isBotRunning} />
        </div>

        {/* Bot Controls */}
        <BotControls
          isBotRunning={isBotRunning}
          onStart={handleStartBot}
          onStop={handleStopBot}
          onClearHistory={handleClearHistory}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration and Live Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="feed">Live Feed</TabsTrigger>
              </TabsList>
              <TabsContent value="config">
                <ConfigPanel config={config} onConfigChange={setConfig} />
              </TabsContent>
              <TabsContent value="feed">
                <LiveFeed trades={trades} />
              </TabsContent>
            </Tabs>

            {/* Positions Table */}
            <PositionsTable positions={positions} onForceSell={handleForceSell} />
          </div>

          {/* Logs Panel */}
          <div className="lg:col-span-1">
            <LogsPanel logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
};
