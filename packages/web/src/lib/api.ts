/**
 * Bitcoin RPC client for browser
 *
 * ARCHITECTURE NOTE: Why we need the RPC proxy
 * ============================================
 *
 * This client communicates with bitcoind through an HTTP proxy server, NOT directly.
 * The browser CANNOT directly connect to bitcoind due to:
 *
 * 1. CORS (Cross-Origin Resource Sharing) restrictions:
 *    - Browsers block cross-origin requests to protect users
 *    - bitcoind does not send CORS headers
 *    - Without the proxy, all RPC calls would fail with CORS errors
 *
 * 2. Authentication handling:
 *    - bitcoind uses HTTP Basic Auth
 *    - The proxy manages credentials securely
 *
 * HOW IT WORKS:
 * -------------
 * 1. Development Mode (NODE_ENV !== 'production'):
 *    - Vite dev server runs on port 5173
 *    - vite.config.ts proxies /rpc requests to localhost:18443 (bitcoind)
 *    - Browser -> Vite (5173) -> bitcoind (18443)
 *
 * 2. Production Mode (NODE_ENV === 'production'):
 *    - Server package's HTTP server serves static files on port 5173
 *    - server.ts proxies /rpc requests to localhost:18443 (bitcoind)
 *    - Browser -> Server (5173) -> bitcoind (18443)
 *
 * In BOTH modes, the web UI needs a proxy to communicate with bitcoind.
 * Without the server package providing this proxy, the web UI is non-functional.
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

export interface MempoolInfo {
  loaded: boolean;
  size: number;
  bytes: number;
  usage: number;
  total_fee: number;
  maxmempool: number;
  mempoolminfee: number;
  minrelaytxfee: number;
  unbroadcastcount: number;
}

export interface MempoolTransaction {
  txid: string;
  vsize: number;
  weight: number;
  fee: number;
  time: number;
  height: number;
  descendantcount: number;
  descendantsize: number;
  descendantfees: number;
  ancestorcount: number;
  ancestorsize: number;
  ancestorfees: number;
  depends: string[];
  bip125_replaceable: boolean;
}

export interface FeeEstimate {
  feerate: number;
  blocks: number;
}

export interface FeeRecommendation {
  low: {
    satPerVByte: number;
    blocks: number;
    eta: string;
  };
  medium: {
    satPerVByte: number;
    blocks: number;
    eta: string;
  };
  high: {
    satPerVByte: number;
    blocks: number;
    eta: string;
  };
  custom?: {
    satPerVByte: number;
    blocks: number;
    eta: string;
  };
}

export interface NetworkStats {
  difficulty: number;
  networkHashrate: number;
  nextRetarget: {
    height: number;
    estimatedDate: string;
    remainingBlocks: number;
    progressPercent: number;
    estimatedChange: number;
  };
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

  async getLatestTransactions(
    limit = 20,
    offset = 0
  ): Promise<RecentTransaction[]> {
    const blockCount = await rpc<number>('getblockcount');
    const transactions: RecentTransaction[] = [];
    const seenTxids = new Set<string>();

    let blocksScanned = 0;
    const maxBlocksToScan = 50;
    let skipped = 0;

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

        const transaction = {
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
        };

        // Skip transactions for offset
        if (skipped < offset) {
          skipped++;
          continue;
        }

        transactions.push(transaction);

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

  async getMempoolInfo(): Promise<MempoolInfo> {
    return await rpc<MempoolInfo>('getmempoolinfo');
  },

  async getRawMempool(): Promise<Record<string, MempoolTransaction>> {
    return await rpc<Record<string, MempoolTransaction>>('getrawmempool', [
      true,
    ]);
  },

  async getMempoolTransactions(): Promise<RecentTransaction[]> {
    const mempoolTxids = await rpc<string[]>('getrawmempool', [false]);
    const transactions: RecentTransaction[] = [];
    const blockCount = await rpc<number>('getblockcount');

    for (const txid of mempoolTxids.slice(0, 50)) {
      try {
        const tx = await rpc<Transaction>('getrawtransaction', [txid, true]);

        const inputs: TransactionInput[] = [];
        let totalInput = 0;

        for (const vin of tx.vin) {
          if (vin.coinbase) {
            inputs.push({ isCoinbase: true });
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
          blockHeight: blockCount,
          blockHash: '',
          time: Date.now() / 1000,
          size: tx.size,
          vsize: tx.vsize,
          weight: tx.weight,
          inputs,
          outputs,
          totalInput,
          totalOutput,
          fee,
        });
      } catch {
        continue;
      }
    }

    return transactions;
  },

  async estimateSmartFee(blocks: number): Promise<FeeEstimate> {
    try {
      const result = await rpc<{ feerate?: number; blocks?: number }>(
        'estimatesmartfee',
        [blocks]
      );
      const feerateInBTC = result.feerate || 0.00001;
      const satPerKB = feerateInBTC * 100000000;
      const satPerVByte = satPerKB / 1000;

      return {
        feerate: satPerVByte,
        blocks: result.blocks || blocks,
      };
    } catch {
      return {
        feerate: 1,
        blocks,
      };
    }
  },

  async getFeeRecommendations(): Promise<FeeRecommendation> {
    const [low, medium, high] = await Promise.all([
      api.estimateSmartFee(6),
      api.estimateSmartFee(3),
      api.estimateSmartFee(1),
    ]);

    const formatETA = (blocks: number): string => {
      const minutes = blocks * 10;
      if (minutes < 60) return `~${minutes} min`;
      const hours = Math.floor(minutes / 60);
      return `~${hours} hour${hours > 1 ? 's' : ''}`;
    };

    return {
      low: {
        satPerVByte: Math.max(1, Math.ceil(low.feerate)),
        blocks: low.blocks,
        eta: formatETA(low.blocks),
      },
      medium: {
        satPerVByte: Math.max(1, Math.ceil(medium.feerate)),
        blocks: medium.blocks,
        eta: formatETA(medium.blocks),
      },
      high: {
        satPerVByte: Math.max(1, Math.ceil(high.feerate)),
        blocks: high.blocks,
        eta: formatETA(high.blocks),
      },
    };
  },

  async sendRawTransaction(hexString: string): Promise<string> {
    return await rpc<string>('sendrawtransaction', [hexString]);
  },

  async getNetworkStats(): Promise<NetworkStats> {
    const info = await api.getBlockchainInfo();
    const blockCount = info.blocks;

    const RETARGET_INTERVAL = 2016;
    const currentEpoch = Math.floor(blockCount / RETARGET_INTERVAL);
    const nextRetargetHeight = (currentEpoch + 1) * RETARGET_INTERVAL;
    const remainingBlocks = nextRetargetHeight - blockCount;
    const progressPercent =
      ((blockCount % RETARGET_INTERVAL) / RETARGET_INTERVAL) * 100;

    const blocksInCurrentEpoch = blockCount % RETARGET_INTERVAL;
    if (blocksInCurrentEpoch < 10) {
      return {
        difficulty: info.difficulty,
        networkHashrate: 0,
        nextRetarget: {
          height: nextRetargetHeight,
          estimatedDate: '',
          remainingBlocks,
          progressPercent,
          estimatedChange: 0,
        },
      };
    }

    const recentBlocks: number[] = [];
    for (let i = 0; i < Math.min(10, blocksInCurrentEpoch); i++) {
      const hash = await rpc<string>('getblockhash', [blockCount - i]);
      const block = await rpc<{ time: number }>('getblock', [hash, 1]);
      recentBlocks.push(block.time);
    }

    recentBlocks.sort((a, b) => a - b);
    const lastBlock = recentBlocks[recentBlocks.length - 1];
    const firstBlock = recentBlocks[0];
    if (!lastBlock || !firstBlock) {
      return {
        difficulty: info.difficulty,
        networkHashrate: 0,
        nextRetarget: {
          height: nextRetargetHeight,
          estimatedDate: '',
          remainingBlocks,
          progressPercent,
          estimatedChange: 0,
        },
      };
    }
    const timeRange = lastBlock - firstBlock;
    const avgBlockTime = timeRange / (recentBlocks.length - 1);

    const estimatedSeconds = remainingBlocks * avgBlockTime;
    const estimatedDate = new Date(Date.now() + estimatedSeconds * 1000);

    const expectedBlockTime = 600;
    const estimatedChange =
      ((expectedBlockTime - avgBlockTime) / expectedBlockTime) * 100;

    const networkHashrate =
      (info.difficulty * Math.pow(2, 32)) / expectedBlockTime / 1e12;

    return {
      difficulty: info.difficulty,
      networkHashrate,
      nextRetarget: {
        height: nextRetargetHeight,
        estimatedDate: estimatedDate.toLocaleString(),
        remainingBlocks,
        progressPercent: Math.min(100, progressPercent),
        estimatedChange: Math.max(-75, Math.min(300, estimatedChange)),
      },
    };
  },
};
