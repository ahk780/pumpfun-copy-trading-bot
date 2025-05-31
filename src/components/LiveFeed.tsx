import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trade } from '@/types/trading';

interface LiveFeedProps {
  trades: Trade[];
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ trades }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Live Trade Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {trades.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No trades yet. Start the bot to see live trades.</p>
          ) : (
            trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={trade.side === 'buy' ? 'default' : 'destructive'}
                    className={trade.side === 'buy' ? 'bg-green-600' : 'bg-red-600'}
                  >
                    {trade.side.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="text-white font-mono text-sm">
                      {trade.mint.substring(0, 8)}...{trade.mint.substring(trade.mint.length - 8)}
                    </p>
                    <p className="text-gray-400 text-xs">{trade.dex}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{trade.solAmount.toFixed(3)} SOL</p>
                  <p className="text-gray-400 text-sm">${trade.priceInUsd.toFixed(2)}</p>
                </div>
                <div className="text-gray-400 text-xs">
                  {formatTime(trade.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
