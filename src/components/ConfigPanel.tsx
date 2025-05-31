
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BotConfig } from '@/types/trading';
import { useToast } from '@/hooks/use-toast';

interface ConfigPanelProps {
  config: BotConfig;
  onConfigChange: (config: BotConfig) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onConfigChange }) => {
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      onConfigChange({
        ...config,
        [parent]: {
          ...(config as any)[parent],
          [child]: value
        }
      });
    } else {
      onConfigChange({
        ...config,
        [field]: value
      });
    }
  };

  const saveConfiguration = () => {
    try {
      localStorage.setItem('tradingBotConfig', JSON.stringify(config));
      toast({
        title: "Configuration Saved",
        description: "Your configuration has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearConfiguration = () => {
    try {
      localStorage.removeItem('tradingBotConfig');
      // Reset to default config
      const defaultConfig: BotConfig = {
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
      onConfigChange(defaultConfig);
      toast({
        title: "Configuration Cleared",
        description: "Configuration has been reset to defaults.",
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Failed to clear configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const testConnection = async (type: 'rpc' | 'websocket') => {
    // Simulate connection test
    const success = Math.random() > 0.3;
    toast({
      title: `${type.toUpperCase()} Connection Test`,
      description: `Connection ${success ? 'successful' : 'failed'}!`,
      variant: success ? "default" : "destructive",
    });
  };

  const isConfigValid = config.coinveraApiKey && config.privateKey && config.walletAddress && config.copyWalletAddress && config.buyAmount > 0;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            Configuration
            <Badge variant="outline" className={isConfigValid ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}>
              {isConfigValid ? 'Valid' : 'Invalid'}
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={saveConfiguration} size="sm" className="bg-blue-600 hover:bg-blue-700">
              Save Config
            </Button>
            <Button onClick={clearConfiguration} variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Clear Config
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="solanaRpcUrl" className="text-gray-300">Solana RPC URL</Label>
            <div className="flex gap-2">
              <Input
                id="solanaRpcUrl"
                value={config.solanaRpcUrl}
                onChange={(e) => handleInputChange('solanaRpcUrl', e.target.value)}
                className="bg-gray-900 border-gray-600 text-white"
                placeholder="https://api.mainnet-beta.solana.com"
              />
              <Button 
                onClick={() => testConnection('rpc')}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Test
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coinveraApiKey" className="text-gray-300">Coinvera API Key</Label>
            <Input
              id="coinveraApiKey"
              type="password"
              value={config.coinveraApiKey}
              onChange={(e) => handleInputChange('coinveraApiKey', e.target.value)}
              className="bg-gray-900 border-gray-600 text-white"
              placeholder="Your Coinvera API key"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="privateKey" className="text-gray-300">Private Key (Base58)</Label>
            <Input
              id="privateKey"
              type="password"
              value={config.privateKey}
              onChange={(e) => handleInputChange('privateKey', e.target.value)}
              className="bg-gray-900 border-gray-600 text-white"
              placeholder="Your wallet's private key in base58 format"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="walletAddress" className="text-gray-300">Wallet Address</Label>
            <Input
              id="walletAddress"
              value={config.walletAddress}
              onChange={(e) => handleInputChange('walletAddress', e.target.value)}
              className="bg-gray-900 border-gray-600 text-white"
              placeholder="Your wallet public key"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="copyWalletAddress" className="text-gray-300">Copy Wallet Address</Label>
            <Input
              id="copyWalletAddress"
              value={config.copyWalletAddress}
              onChange={(e) => handleInputChange('copyWalletAddress', e.target.value)}
              className="bg-gray-900 border-gray-600 text-white"
              placeholder="Wallet to copy trades from"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyAmount" className="text-gray-300">Buy Amount (SOL)</Label>
            <Input
              id="buyAmount"
              type="number"
              step="0.01"
              min="0.01"
              value={config.buyAmount}
              onChange={(e) => handleInputChange('buyAmount', parseFloat(e.target.value))}
              className="bg-gray-900 border-gray-600 text-white"
              placeholder="Amount of SOL to spend per trade"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jitoTip" className="text-gray-300">Jito Tip (SOL)</Label>
            <Input
              id="jitoTip"
              type="number"
              step="0.0001"
              value={config.jitoTip}
              onChange={(e) => handleInputChange('jitoTip', parseFloat(e.target.value))}
              className="bg-gray-900 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slippage" className="text-gray-300">Slippage (%)</Label>
            <Input
              id="slippage"
              type="number"
              value={config.slippage}
              onChange={(e) => handleInputChange('slippage', parseInt(e.target.value))}
              className="bg-gray-900 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stopLossPct" className="text-gray-300">Stop Loss (%)</Label>
            <Input
              id="stopLossPct"
              type="number"
              value={config.stopLossPct}
              onChange={(e) => handleInputChange('stopLossPct', parseInt(e.target.value))}
              className="bg-gray-900 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="takeProfitPct" className="text-gray-300">Take Profit (%)</Label>
            <Input
              id="takeProfitPct"
              type="number"
              value={config.takeProfitPct}
              onChange={(e) => handleInputChange('takeProfitPct', parseInt(e.target.value))}
              className="bg-gray-900 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeoutMs" className="text-gray-300">Timeout (ms)</Label>
            <Input
              id="timeoutMs"
              type="number"
              value={config.timeoutMs}
              onChange={(e) => handleInputChange('timeoutMs', parseInt(e.target.value))}
              className="bg-gray-900 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceCheckDelayMs" className="text-gray-300">Price Check Delay (ms)</Label>
            <Input
              id="priceCheckDelayMs"
              type="number"
              min="500"
              value={config.priceCheckDelayMs}
              onChange={(e) => handleInputChange('priceCheckDelayMs', parseInt(e.target.value))}
              className="bg-gray-900 border-gray-600 text-white"
              placeholder="Delay between price checks"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websocketUrl" className="text-gray-300">WebSocket URL</Label>
            <div className="flex gap-2">
              <Input
                id="websocketUrl"
                value={config.websocket.url}
                onChange={(e) => handleInputChange('websocket.url', e.target.value)}
                className="bg-gray-900 border-gray-600 text-white"
              />
              <Button 
                onClick={() => testConnection('websocket')}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Test
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pingInterval" className="text-gray-300">Ping Interval (ms)</Label>
            <Input
              id="pingInterval"
              type="number"
              value={config.websocket.pingIntervalMs}
              onChange={(e) => handleInputChange('websocket.pingIntervalMs', parseInt(e.target.value))}
              className="bg-gray-900 border-gray-600 text-white"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
