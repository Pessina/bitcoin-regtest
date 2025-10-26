import Client from 'bitcoin-core';

export interface BitcoinTransaction {
  txid: string;
  confirmations: number;
  blockhash?: string;
  blockindex?: number;
  blocktime?: number;
  time: number;
  timereceived: number;
  details: Array<{
    address: string;
    category: string;
    amount: number;
    label?: string;
    vout: number;
  }>;
  hex: string;
}

export interface BitcoinTransactionListItem {
  address: string;
  category: string;
  amount: number;
  label?: string;
  confirmations: number;
  blockhash?: string;
  blockindex?: number;
  blocktime?: number;
  txid: string;
  time: number;
  timereceived: number;
}

export interface BlockchainInfo {
  chain: string;
  blocks: number;
  bestblockhash: string;
  difficulty: number;
  mediantime: number;
  size_on_disk: number;
}

export interface Block {
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
  tx?: unknown[];
}

export interface BitcoinRpcClient extends Client {
  getBlockchainInfo(): Promise<BlockchainInfo>;
  getBlockCount(): Promise<number>;
  getBlockHash(height: number): Promise<string>;
  getBlock(hash: string, verbosity: number): Promise<Block>;
  createWallet(name: string): Promise<unknown>;
  loadWallet(name: string): Promise<unknown>;
  getNewAddress(label?: string): Promise<string>;
  getBalance(): Promise<number>;
  sendToAddress(address: string, amount: number): Promise<string>;
  getTransaction(txid: string): Promise<BitcoinTransaction>;
  listTransactions(
    account: string,
    count?: number
  ): Promise<BitcoinTransactionListItem[]>;
  generateToAddress(blocks: number, address: string): Promise<string[]>;
  stop(): Promise<void>;
}
