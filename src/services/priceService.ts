import { LogEntry } from '@/types/trading';

export const fetchTokenPrice = async (
  mint: string,
  coinveraApiKey: string,
  addLog: (level: LogEntry['level'], message: string, data?: any) => void,
  retryCount: number = 1
) => {
  try {
    addLog('info', `🎯 Fetching price for ${mint.substring(0, 8)}...${mint.substring(mint.length - 8)}`);
    
    // Make sure we're using the full URL for the API request
    const url = `/api/price?ca=${mint}&x-api-key=${encodeURIComponent(coinveraApiKey)}`;
    console.log('Making price request to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Price API response:', data);
    
    // Extract the exact fields from the API response
    const priceInSol = data.priceInSol || 0;
    const priceInUsd = data.priceInUsd || 0;
    const marketCap = data.marketCap || 0;
    
    // If we got valid price data, return it
    if (priceInUsd > 0) {
      addLog('success', `💰 Price fetched successfully: USD=$${priceInUsd.toFixed(8)} | SOL=${priceInSol.toFixed(8)}`);
      
      return {
        priceInSol,
        priceInUsd,
        marketCap
      };
    }
    
    addLog('warning', `⚠️ Zero price data received for ${mint}`);
    
  } catch (error) {
    console.error('Price fetch error:', error);
    addLog('error', `💥 Price fetch failed for ${mint}: ${error}`);
  }
  
  // Return zeros if fetch fails
  addLog('warning', `🔄 Returning fallback zero prices for ${mint}`);
  return {
    priceInSol: 0,
    priceInUsd: 0,
    marketCap: 0
  };
};
