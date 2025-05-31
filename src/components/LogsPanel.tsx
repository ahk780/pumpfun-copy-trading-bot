
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogEntry } from '@/types/trading';

interface LogsPanelProps {
  logs: LogEntry[];
}

export const LogsPanel: React.FC<LogsPanelProps> = ({ logs }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'bg-green-600';
      case 'error': return 'bg-red-600';
      case 'warning': return 'bg-yellow-600';
      default: return 'bg-blue-600';
    }
  };

  // Sort logs by timestamp descending (newest first) to ensure proper order
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardHeader>
        <CardTitle className="text-white">System Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedLogs.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No logs yet</p>
          ) : (
            sortedLogs.map((log, index) => (
              <div
                key={`${log.id}-${log.timestamp}-${index}`}
                className="p-3 bg-gray-900 rounded-lg border border-gray-700"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={getLevelColor(log.level)}>
                    {log.level.toUpperCase()}
                  </Badge>
                  <span className="text-gray-400 text-xs">
                    {formatTime(log.timestamp)}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{log.message}</p>
                {log.data && (
                  <pre className="text-xs text-gray-500 mt-1 overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
