const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001';

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

export const api = {
  async getLatestBlocks(limit = 10): Promise<Block[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/blocks/latest?limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch latest blocks');
    return response.json() as Promise<Block[]>;
  },

  async getBlock(heightOrHash: string | number): Promise<BlockDetail> {
    const response = await fetch(`${API_BASE_URL}/api/blocks/${heightOrHash}`);
    if (!response.ok) throw new Error('Failed to fetch block');
    return response.json() as Promise<BlockDetail>;
  },

  async getAddressBalance(address: string): Promise<AddressBalance> {
    const response = await fetch(
      `${API_BASE_URL}/api/address/${address}/balance`
    );
    if (!response.ok) throw new Error('Failed to fetch address balance');
    return response.json() as Promise<AddressBalance>;
  },

  async getBlockchainInfo(): Promise<BlockchainInfo> {
    const response = await fetch(`${API_BASE_URL}/api/blockchain/info`);
    if (!response.ok) throw new Error('Failed to fetch blockchain info');
    return response.json() as Promise<BlockchainInfo>;
  },
};
