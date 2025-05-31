
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Position } from '@/types/trading';

interface PositionsTableProps {
  positions: Position[];
  onForceSell: (mint: string) => void;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({ positions, onForceSell }) => {
  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-400';
    if (pnl < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getPnLBadgeVariant = (pnl: number) => {
    if (pnl > 0) return 'default';
    if (pnl < 0) return 'destructive';
    return 'secondary';
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '$0.000000';
    if (price < 0.000001) {
      return `$${price.toExponential(6)}`;
    }
    return `$${price.toFixed(8)}`;
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Open Positions ({positions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No open positions</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Mint Address</TableHead>
                  <TableHead className="text-gray-300">Entry Price</TableHead>
                  <TableHead className="text-gray-300">Current Price</TableHead>
                  <TableHead className="text-gray-300">PnL %</TableHead>
                  <TableHead className="text-gray-300">Time Held</TableHead>
                  <TableHead className="text-gray-300">Size (SOL)</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.mint} className="border-gray-700">
                    <TableCell className="text-white font-mono text-sm">
                      {position.mint.substring(0, 8)}...{position.mint.substring(position.mint.length - 8)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {formatPrice(position.entryPriceUsd)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {formatPrice(position.currentPriceUsd)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getPnLBadgeVariant(position.pnlPct)}
                        className={`${getPnLColor(position.pnlPct)} font-semibold`}
                      >
                        {position.pnlPct > 0 ? '+' : ''}{position.pnlPct.toFixed(2)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{position.timeHeld}</TableCell>
                    <TableCell className="text-gray-300">{position.solSize.toFixed(3)}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => onForceSell(position.mint)}
                        size="sm"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Force Sell
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
