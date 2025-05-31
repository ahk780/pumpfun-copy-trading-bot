import { useCallback } from 'react';
import { BotConfig, LogEntry } from '@/types/trading';
import { fetchTokenPrice } from '@/services/priceService';
import { 
  fetchUnsignedTransaction, 
  createAndSignTransaction 
} from '@/services/transactionService';
import { 
  submitTransactionToJito, 
  waitForTransactionConfirmation, 
  inspectTransactionForTokenAmounts 
} from '@/services/jitoService';
import { Connection, PublicKey } from '@solana/web3.js';

export const useTradingService = (
  config: BotConfig,
  addLog: (level: LogEntry['level'], message: string, data?: any) => void
) => {
  const getTokenPrice = useCallback(async (mint: string) => {
    return await fetchTokenPrice(mint, config.coinveraApiKey, addLog, 3);
  }, [config.coinveraApiKey, addLog]);

  const getActualTokenBalance = useCallback(async (mint: string): Promise<number> => {
    try {
      addLog('info', `Fetching actual token balance for ${mint}...`);
      
      const connection = new Connection(config.solanaRpcUrl, 'confirmed');
      const walletPubkey = new PublicKey(config.walletAddress);
      const mintPubkey = new PublicKey(mint);
      
      // Get token accounts for this wallet and mint
      const tokenAccounts = await connection.getTokenAccountsByOwner(walletPubkey, {
        mint: mintPubkey
      });
      
      if (tokenAccounts.value.length === 0) {
        addLog('warning', `No token account found for ${mint}`);
        return 0;
      }

      // Get mint info to get decimals
      const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
      if (!mintInfo.value) {
        addLog('warning', `Could not get mint info for ${mint}`);
        return 0;
      }

      const decimals = (mintInfo.value.data as any).parsed.info.decimals;
      
      // Get token account info
      const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccounts.value[0].pubkey);
      const rawBalance = tokenAccountInfo.value.amount;
      
      // Convert raw balance to actual balance using decimals
      const balance = Number(rawBalance) / Math.pow(10, decimals);
      
      addLog('info', `Actual token balance for ${mint}: ${balance} (decimals: ${decimals})`);
      return balance;
      
    } catch (error) {
      addLog('error', `Failed to get token balance for ${mint}: ${error}`);
      return 0;
    }
  }, [config.solanaRpcUrl, config.walletAddress, addLog]);

  const executeOrder = useCallback(async (mint: string, action: 'buy' | 'sell', amount: number) => {
    try {
      if (!config.privateKey || !config.walletAddress) {
        addLog('error', 'Missing private key or wallet address for trading');
        return null;
      }

      // Step 1: Get unsigned transaction from SolanaPortal
      const transactionData = await fetchUnsignedTransaction(
        config.walletAddress,
        action,
        mint,
        amount,
        config.slippage,
        config.jitoTip,
        addLog
      );

      // Step 2: Sign the transaction
      const signedTransaction = await createAndSignTransaction(
        transactionData,
        config.privateKey,
        addLog
      );

      // Step 3: Submit to Jito RPC
      const signature = await submitTransactionToJito(signedTransaction, addLog);

      // Step 4: Wait for confirmation
      await waitForTransactionConfirmation(signature, config.solanaRpcUrl, addLog);

      // Step 5: Inspect transaction for token amounts
      const actualTokenAmount = await inspectTransactionForTokenAmounts(
        signature,
        mint,
        config.walletAddress,
        config.solanaRpcUrl,
        addLog
      );

      if (actualTokenAmount > 0) {
        addLog('success', `${action.toUpperCase()} order completed successfully!`, {
          signature,
          tokenAmount: actualTokenAmount,
          solAmount: amount,
          mint
        });
      } else {
        addLog('success', `${action.toUpperCase()} order completed (inspection failed but transaction confirmed)`, {
          signature,
          solAmount: amount,
          mint
        });
      }

      return signature;
      
    } catch (error) {
      addLog('error', `Failed to execute ${action} order: ${error}`);
      return null;
    }
  }, [config, addLog]);

  return {
    getTokenPrice,
    executeOrder,
    getActualTokenBalance
  };
};
