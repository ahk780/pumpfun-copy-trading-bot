
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Square, Trash2 } from 'lucide-react';

interface BotControlsProps {
  isBotRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onClearHistory: () => void;
}

export const BotControls: React.FC<BotControlsProps> = ({
  isBotRunning,
  onStart,
  onStop,
  onClearHistory
}) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button
              onClick={isBotRunning ? onStop : onStart}
              className={`${
                isBotRunning 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isBotRunning ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Bot
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Bot
                </>
              )}
            </Button>
            
            <Button
              onClick={onClearHistory}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </Button>
          </div>
          
          <div className="text-sm text-gray-400">
            Status: {isBotRunning ? 'Running' : 'Stopped'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
