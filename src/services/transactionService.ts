
import { Keypair, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { LogEntry } from '@/types/trading';

export const createAndSignTransaction = async (
  transactionData: any,
  privateKey: string,
  addLog: (level: LogEntry['level'], message: string, data?: any) => void
): Promise<VersionedTransaction> => {
  addLog('info', 'Step 3: Signing transaction with private key...');
  
  try {
    // Parse base58 private key using standalone bs58
    let privateKeyBytes: Uint8Array;
    
    try {
      privateKeyBytes = bs58.decode(privateKey);
      addLog('info', `Private key parsed successfully from base58, length: ${privateKeyBytes.length} bytes`);
    } catch (base58Error) {
      addLog('error', `Failed to parse private key as base58: ${base58Error}`);
      throw new Error('Private key must be a valid base58 string');
    }
    
    if (privateKeyBytes.length !== 64) {
      throw new Error(`Invalid private key length: ${privateKeyBytes.length}. Expected 64 bytes.`);
    }
    
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    addLog('info', `Keypair created successfully. Public key: ${keypair.publicKey.toString()}`);
    
    // Convert base64 transaction data to buffer (browser compatible)
    let transaction: VersionedTransaction;
    
    try {
      // Create buffer from base64 data (browser compatible)
      const base64Data = transactionData.trim();
      addLog('info', `Processing base64 transaction data: ${base64Data.substring(0, 50)}...`);
      
      // Convert base64 to Uint8Array using browser-compatible method
      const binaryString = atob(base64Data);
      const txnBuffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        txnBuffer[i] = binaryString.charCodeAt(i);
      }
      addLog('info', `Transaction buffer created, length: ${txnBuffer.length} bytes`);
      
      // Deserialize transaction
      transaction = VersionedTransaction.deserialize(txnBuffer);
      addLog('info', 'Transaction deserialized successfully');
      
    } catch (deserializeError) {
      addLog('error', `Transaction deserialization failed: ${deserializeError}`);
      throw new Error(`Failed to deserialize transaction: ${deserializeError}`);
    }
    
    // Sign the transaction
    transaction.sign([keypair]);
    addLog('info', 'Transaction signed successfully');
    
    return transaction;
    
  } catch (signingError) {
    throw new Error(`Transaction signing failed: ${signingError}`);
  }
};

export const fetchUnsignedTransaction = async (
  walletAddress: string,
  action: 'buy' | 'sell',
  mint: string,
  amount: number,
  slippage: number,
  jitoTip: number,
  addLog: (level: LogEntry['level'], message: string, data?: any) => void
): Promise<any> => {
  addLog('info', `Step 1: Creating ${action} transaction for ${mint} with amount ${amount}`);
  
  const param = {
    wallet_address: walletAddress,
    action,
    dex: 'pumpfun',
    mint,
    amount,
    slippage,
    tip: jitoTip,
    type: 'jito'
  };

  // Get transaction from SolanaPortal
  const response = await fetch('https://api.solanaportal.io/api/trading', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(param)
  });

  if (!response.ok) {
    throw new Error(`SolanaPortal API error: ${response.status} ${response.statusText}`);
  }

  // Return JSON response (not text) to match your working example
  const transactionData = await response.json();
  addLog('info', `Step 2: Transaction received from SolanaPortal`);
  
  return transactionData;
};
