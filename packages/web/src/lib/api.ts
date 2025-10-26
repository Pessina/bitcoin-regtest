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
}

export interface UTXO {
  txid: string;
  vout: number;
  scriptPubKey: string;
  desc: string;
  amount: number;
  height: number;
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
    const utxos = await rpc<{
      total_amount: number;
      unspents: UTXO[];
    }>('scantxoutset', ['start', [`addr(${address})`]]);

    return {
      address,
      balance: utxos.total_amount || 0,
      utxoCount: utxos.unspents?.length || 0,
      utxos: utxos.unspents || [],
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
};
