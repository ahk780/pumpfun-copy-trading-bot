
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface StatusIndicatorProps {
  isConnected: boolean;
  isBotRunning: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isConnected,
  isBotRunning
}) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-300">WebSocket</span>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isBotRunning ? 'bg-blue-500' : 'bg-gray-500'}`} />
            <span className="text-sm text-gray-300">Bot</span>
            <Badge variant={isBotRunning ? 'default' : 'secondary'}>
              {isBotRunning ? 'Running' : 'Stopped'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
