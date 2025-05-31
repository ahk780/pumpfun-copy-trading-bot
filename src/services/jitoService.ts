
import { VersionedTransaction, Connection } from '@solana/web3.js';
import bs58 from 'bs58';
import { LogEntry } from '@/types/trading';

export const submitTransactionToJito = async (
  transaction: VersionedTransaction,
  addLog: (level: LogEntry['level'], message: string, data?: any) => void
): Promise<string> => {
  addLog('info', 'Step 4: Submitting transaction via Jito RPC...');
  
  try {
    // Serialize and encode transaction using bs58 (matching your working example)
    const serializedTransaction = transaction.serialize();
    const signedTxnBuffer = bs58.encode(serializedTransaction);
    
    addLog('info', `Transaction serialized and encoded with bs58`);
    
    const jitoResponse = await fetch('https://tokyo.mainnet.block-engine.jito.wtf/api/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [signedTxnBuffer]
      })
    });
    
    if (!jitoResponse.ok) {
      throw new Error(`Jito RPC error: ${jitoResponse.status} ${jitoResponse.statusText}`);
    }
    
    const jitoResult = await jitoResponse.json();
    
    if (jitoResult.error) {
      throw new Error(`Jito RPC error: ${jitoResult.error.message}`);
    }
    
    const signature = jitoResult.result;
    addLog('info', `Transaction submitted to Jito with signature: ${signature}`);
    addLog('success', `Transaction successful: https://solscan.io/tx/${signature}`);
    
    return signature;
    
  } catch (error) {
    addLog('error', `Failed to submit transaction to Jito: ${error}`);
    throw error;
  }
};

export const waitForTransactionConfirmation = async (
  signature: string,
  solanaRpcUrl: string,
  addLog: (level: LogEntry['level'], message: string, data?: any) => void
): Promise<void> => {
  // Step 4: Wait for transaction confirmation
  addLog('info', 'Step 5: Waiting for transaction confirmation...');
  
  const connection = new Connection(solanaRpcUrl, 'confirmed');
  
  // Poll for confirmation with timeout
  const maxAttempts = 30; // 30 seconds timeout
  let attempts = 0;
  let confirmed = false;
  
  while (attempts < maxAttempts && !confirmed) {
    try {
      const status = await connection.getSignatureStatus(signature);
      
      if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
        confirmed = true;
        addLog('info', `Transaction confirmed: ${signature}`);
        break;
      }
      
      if (status.value?.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;
      
    } catch (confirmError) {
      addLog('warning', `Confirmation attempt ${attempts + 1} failed: ${confirmError}`);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  if (!confirmed) {
    throw new Error('Transaction confirmation timeout');
  }
};

export const inspectTransactionForTokenAmounts = async (
  signature: string,
  mint: string,
  walletAddress: string,
  solanaRpcUrl: string,
  addLog: (level: LogEntry['level'], message: string, data?: any) => void
): Promise<number> => {
  // Step 5: Inspect transaction for actual token amounts
  addLog('info', 'Step 6: Inspecting transaction for token amounts...');
  
  try {
    const connection = new Connection(solanaRpcUrl, 'confirmed');
    const transactionDetails = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });
    
    if (!transactionDetails) {
      throw new Error('Transaction details not found');
    }
    
    // Parse token balances from transaction
    const preTokenBalances = transactionDetails.meta?.preTokenBalances || [];
    const postTokenBalances = transactionDetails.meta?.postTokenBalances || [];
    
    let actualTokenAmount = 0;
    
    // Find token balance changes for our wallet
    for (const postBalance of postTokenBalances) {
      if (postBalance.mint === mint && postBalance.owner === walletAddress) {
        const preBalance = preTokenBalances.find(
          pre => pre.mint === mint && pre.owner === walletAddress
        );
        
        const preAmount = preBalance ? preBalance.uiTokenAmount.uiAmount || 0 : 0;
        const postAmount = postBalance.uiTokenAmount.uiAmount || 0;
        
        actualTokenAmount = Math.abs(postAmount - preAmount);
        break;
      }
    }
    
    return actualTokenAmount;
    
  } catch (inspectionError) {
    addLog('warning', `Transaction inspection failed: ${inspectionError}`);
    return 0;
  }
};
