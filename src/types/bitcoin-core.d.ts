declare module 'bitcoin-core' {
  interface ClientOptions {
    network?: 'mainnet' | 'testnet' | 'regtest';
    host?: string;
    port?: number;
    username?: string;
    password?: string;
  }

  class Client {
    constructor(options?: ClientOptions);

    getBlockchainInfo(): Promise<any>;
    getBlockCount(): Promise<number>;
    createWallet(name: string): Promise<any>;
    loadWallet(name: string): Promise<any>;
    getNewAddress(label?: string): Promise<string>;
    getBalance(): Promise<number>;
    sendToAddress(address: string, amount: number): Promise<string>;
    getTransaction(txid: string): Promise<any>;
    listTransactions(account: string, count?: number): Promise<any[]>;
    generateToAddress(blocks: number, address: string): Promise<string[]>;
    stop(): Promise<void>;
  }

  export = Client;
}
