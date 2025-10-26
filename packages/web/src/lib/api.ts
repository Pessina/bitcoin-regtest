/**
 * Bitcoin RPC client for browser
 * Calls bitcoind RPC directly via Vite proxy
 */

const RPC_URL = '/rpc';
const RPC_USER = 'test';
const RPC_PASSWORD = 'test123';

export interface Block {
  height: number;
  hash: string;
  time: number;
  size: number;
  txCount: number;
  difficulty: number;
}

export interface BlockDetail extends Block {
  weight: number;
  version: number;
  merkleroot: string;
  nonce: number;
  bits: string;
  previousblockhash?: string;
  nextblockhash?: string;
  transactions: Transaction[];
}

export interface Transaction {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  vin: VIn[];
  vout: VOut[];
}

export interface VIn {
  txid?: string;
  vout?: number;
  scriptSig?: {
    asm: string;
    hex: string;
  };
  sequence: number;
  coinbase?: string;
}

export interface VOut {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    desc?: string;
    hex: string;
    address?: string;
    type: string;
  };
}

export interface AddressBalance {
  address: string;
  balance: number;
  utxoCount: number;
  utxos: UTXO[];
  transactions: AddressTransaction[];
}

export interface UTXO {
  txid: string;
  vout: number;
  scriptPubKey: string;
  desc: string;
  amount: number;
  height: number;
}

export interface AddressTransaction {
  txid: string;
  time: number;
  blockHeight: number;
  type: 'incoming' | 'outgoing';
  amount: number;
  confirmations: number;
}

export interface TransactionInput {
  txid?: string;
  vout?: number;
  address?: string;
  value?: number;
  isCoinbase: boolean;
}

export interface TransactionOutput {
  n: number;
  value: number;
  address?: string;
  scriptType: string;
}

export interface RecentTransaction {
  txid: string;
  hash: string;
  blockHeight: number;
  blockHash: string;
  time: number;
  size: number;
  vsize: number;
  weight: number;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  totalInput: number;
  totalOutput: number;
  fee: number;
}

export interface BlockchainInfo {
  chain: string;
  blocks: number;
  bestblockhash: string;
  difficulty: number;
  mediantime: number;
  size_on_disk: number;
}

/**
 * Call Bitcoin RPC method
 */
async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + btoa(`${RPC_USER}:${RPC_PASSWORD}`),
    },
    body: JSON.stringify({
      jsonrpc: '1.0',
      id: 'browser',
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`Bitcoin RPC error: ${data.error.message}`);
  }

  return data.result;
}

export const api = {
  async getLatestBlocks(limit = 10): Promise<Block[]> {
    const blockCount = await rpc<number>('getblockcount');
    const blocks: Block[] = [];

    for (let i = 0; i < limit && blockCount - i >= 0; i++) {
      const blockHash = await rpc<string>('getblockhash', [blockCount - i]);
      const block = await rpc<{
        height: number;
        hash: string;
        time: number;
        size: number;
        difficulty: number;
        tx: string[];
      }>('getblock', [blockHash, 2]);

      blocks.push({
        height: block.height,
        hash: block.hash,
        time: block.time,
        size: block.size,
        txCount: block.tx?.length || 0,
        difficulty: block.difficulty,
      });
    }

    return blocks;
  },

  async getBlock(heightOrHash: string | number): Promise<BlockDetail> {
    let blockHash: string;

    if (typeof heightOrHash === 'number' || /^\d+$/.test(heightOrHash)) {
      blockHash = await rpc<string>('getblockhash', [Number(heightOrHash)]);
    } else {
      blockHash = heightOrHash;
    }

    const block = await rpc<{
      height: number;
      hash: string;
      time: number;
      size: number;
      weight: number;
      version: number;
      merkleroot: string;
      nonce: number;
      bits: string;
      difficulty: number;
      previousblockhash?: string;
      nextblockhash?: string;
      tx: Transaction[];
    }>('getblock', [blockHash, 2]);

    return {
      height: block.height,
      hash: block.hash,
      time: block.time,
      size: block.size,
      weight: block.weight,
      version: block.version,
      merkleroot: block.merkleroot,
      nonce: block.nonce,
      bits: block.bits,
      difficulty: block.difficulty,
      previousblockhash: block.previousblockhash,
      nextblockhash: block.nextblockhash,
      transactions: block.tx || [],
      txCount: block.tx?.length || 0,
    };
  },

  async getAddressBalance(address: string): Promise<AddressBalance> {
    // Get current UTXOs and balance
    const utxos = await rpc<{
      success: boolean;
      total_amount: number;
      unspents: UTXO[];
    }>('scantxoutset', ['start', [`addr(${address})`]]);

    if (!utxos.success) {
      throw new Error('Failed to scan UTXO set for address');
    }

    // Get transaction history by scanning recent blocks
    const blockCount = await rpc<number>('getblockcount');
    const transactions: AddressTransaction[] = [];
    const seenTxids = new Set<string>();

    // Scan last 100 blocks (or fewer if blockchain is shorter)
    const blocksToScan = Math.min(100, blockCount + 1);
    const startHeight = Math.max(0, blockCount - blocksToScan + 1);

    for (let height = blockCount; height >= startHeight; height--) {
      const blockHash = await rpc<string>('getblockhash', [height]);
      const block = await rpc<{
        time: number;
        tx: Transaction[];
      }>('getblock', [blockHash, 2]);

      for (const tx of block.tx) {
        // Skip if already processed
        if (seenTxids.has(tx.txid)) continue;

        // Check if transaction involves this address
        let incoming = 0;
        let outgoing = 0;

        // Check outputs (incoming)
        for (const vout of tx.vout) {
          if (vout.scriptPubKey.address === address) {
            incoming += vout.value;
          }
        }

        // Check inputs (outgoing) - need to fetch previous transactions
        for (const vin of tx.vin) {
          if (vin.txid && vin.vout !== undefined) {
            try {
              const prevTx = await rpc<Transaction>('getrawtransaction', [
                vin.txid,
                true,
              ]);
              const prevOut = prevTx.vout[vin.vout];
              if (prevOut?.scriptPubKey.address === address) {
                outgoing += prevOut.value;
              }
            } catch {
              // Ignore errors (e.g., coinbase transactions)
            }
          }
        }

        // Add transaction if it involves this address
        if (incoming > 0 || outgoing > 0) {
          const netAmount = incoming - outgoing;
          transactions.push({
            txid: tx.txid,
            time: block.time,
            blockHeight: height,
            type: netAmount >= 0 ? 'incoming' : 'outgoing',
            amount: Math.abs(netAmount),
            confirmations: blockCount - height + 1,
          });
          seenTxids.add(tx.txid);
        }
      }
    }

    // Sort by time (newest first)
    transactions.sort((a, b) => b.time - a.time);

    return {
      address,
      balance: utxos.total_amount || 0,
      utxoCount: utxos.unspents?.length || 0,
      utxos: utxos.unspents || [],
      transactions,
    };
  },

  async getBlockchainInfo(): Promise<BlockchainInfo> {
    const info = await rpc<{
      chain: string;
      blocks: number;
      bestblockhash: string;
      difficulty: number;
      mediantime: number;
      size_on_disk: number;
    }>('getblockchaininfo');

    return {
      chain: info.chain,
      blocks: info.blocks,
      bestblockhash: info.bestblockhash,
      difficulty: info.difficulty,
      mediantime: info.mediantime,
      size_on_disk: info.size_on_disk,
    };
  },

  async sendFunds(address: string, amount: number): Promise<string> {
    const txid = await rpc<string>('sendtoaddress', [address, amount]);
    return txid;
  },

  async getLatestTransactions(limit = 20): Promise<RecentTransaction[]> {
    const blockCount = await rpc<number>('getblockcount');
    const transactions: RecentTransaction[] = [];
    const seenTxids = new Set<string>();

    let blocksScanned = 0;
    const maxBlocksToScan = 10;

    for (
      let height = blockCount;
      height >= 0 && blocksScanned < maxBlocksToScan;
      height--
    ) {
      const blockHash = await rpc<string>('getblockhash', [height]);
      const block = await rpc<{
        hash: string;
        time: number;
        tx: Transaction[];
      }>('getblock', [blockHash, 2]);

      blocksScanned++;

      for (const tx of block.tx) {
        if (seenTxids.has(tx.txid)) continue;
        seenTxids.add(tx.txid);

        const inputs: TransactionInput[] = [];
        let totalInput = 0;

        for (const vin of tx.vin) {
          if (vin.coinbase) {
            inputs.push({
              isCoinbase: true,
            });
          } else if (vin.txid && vin.vout !== undefined) {
            try {
              const prevTx = await rpc<Transaction>('getrawtransaction', [
                vin.txid,
                true,
              ]);
              const prevOut = prevTx.vout[vin.vout];
              if (prevOut) {
                totalInput += prevOut.value;
                inputs.push({
                  txid: vin.txid,
                  vout: vin.vout,
                  address: prevOut.scriptPubKey.address,
                  value: prevOut.value,
                  isCoinbase: false,
                });
              }
            } catch {
              inputs.push({
                txid: vin.txid,
                vout: vin.vout,
                isCoinbase: false,
              });
            }
          }
        }

        const outputs: TransactionOutput[] = tx.vout.map((vout) => ({
          n: vout.n,
          value: vout.value,
          address: vout.scriptPubKey.address,
          scriptType: vout.scriptPubKey.type,
        }));

        const totalOutput = tx.vout.reduce((sum, vout) => sum + vout.value, 0);
        const fee = inputs[0]?.isCoinbase ? 0 : totalInput - totalOutput;

        transactions.push({
          txid: tx.txid,
          hash: tx.hash,
          blockHeight: height,
          blockHash: block.hash,
          time: block.time,
          size: tx.size,
          vsize: tx.vsize,
          weight: tx.weight,
          inputs,
          outputs,
          totalInput,
          totalOutput,
          fee,
        });

        if (transactions.length >= limit) {
          return transactions;
        }
      }
    }

    return transactions;
  },

  async getTransaction(txid: string): Promise<RecentTransaction> {
    const tx = await rpc<Transaction>('getrawtransaction', [txid, true]);
    const blockCount = await rpc<number>('getblockcount');

    const blockHash = await rpc<string>('getblockhash', [
      (tx as unknown as { blockhash: string }).blockhash
        ? undefined
        : blockCount,
    ]).catch(async () => {
      const rawTx = tx as unknown as { blockhash?: string };
      return rawTx.blockhash || '';
    });

    const block = await rpc<{
      hash: string;
      time: number;
      height: number;
    }>('getblock', [
      (tx as unknown as { blockhash?: string }).blockhash || blockHash,
      1,
    ]);

    const inputs: TransactionInput[] = [];
    let totalInput = 0;

    for (const vin of tx.vin) {
      if (vin.coinbase) {
        inputs.push({
          isCoinbase: true,
        });
      } else if (vin.txid && vin.vout !== undefined) {
        try {
          const prevTx = await rpc<Transaction>('getrawtransaction', [
            vin.txid,
            true,
          ]);
          const prevOut = prevTx.vout[vin.vout];
          if (prevOut) {
            totalInput += prevOut.value;
            inputs.push({
              txid: vin.txid,
              vout: vin.vout,
              address: prevOut.scriptPubKey.address,
              value: prevOut.value,
              isCoinbase: false,
            });
          }
        } catch {
          inputs.push({
            txid: vin.txid,
            vout: vin.vout,
            isCoinbase: false,
          });
        }
      }
    }

    const outputs: TransactionOutput[] = tx.vout.map((vout) => ({
      n: vout.n,
      value: vout.value,
      address: vout.scriptPubKey.address,
      scriptType: vout.scriptPubKey.type,
    }));

    const totalOutput = tx.vout.reduce((sum, vout) => sum + vout.value, 0);
    const fee = inputs[0]?.isCoinbase ? 0 : totalInput - totalOutput;

    return {
      txid: tx.txid,
      hash: tx.hash,
      blockHeight: block.height,
      blockHash: block.hash,
      time: block.time,
      size: tx.size,
      vsize: tx.vsize,
      weight: tx.weight,
      inputs,
      outputs,
      totalInput,
      totalOutput,
      fee,
    };
  },
};
