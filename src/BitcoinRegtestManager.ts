import Client from 'bitcoin-core';
import { ChildProcess, spawn } from 'child_process';

import {
  BitcoinRegtestConfig,
  mergeConfig,
  PartialBitcoinRegtestConfig,
} from './config';
import {
  BitcoinRpcClient,
  BitcoinTransaction,
  BitcoinTransactionListItem,
} from './types';

export class BitcoinRegtestManager {
  private client: BitcoinRpcClient;
  private config: BitcoinRegtestConfig;
  private bitcoindProcess: ChildProcess | null = null;
  private walletAddress: string | null = null;
  private autoMineTimer: NodeJS.Timeout | null = null;

  constructor(config?: PartialBitcoinRegtestConfig) {
    this.config = mergeConfig(config);
    this.client = new Client({
      host: `http://${this.config.rpcHost}:${this.config.rpcPort}`,
      username: this.config.rpcUser,
      password: this.config.rpcPassword,
    }) as BitcoinRpcClient;
  }

  private log(message: string, data?: unknown): void {
    if (data) {
      console.log(message, JSON.stringify(data, null, 2));
    } else {
      console.log(message);
    }
  }

  async isBitcoindRunning(): Promise<boolean> {
    try {
      await this.client.getBlockchainInfo();
      return true;
    } catch {
      return false;
    }
  }

  async startBitcoind(): Promise<void> {
    const isRunning = await this.isBitcoindRunning();
    if (isRunning) {
      this.log('bitcoind already running');
      return;
    }

    return new Promise((resolve, reject) => {
      this.log('Starting bitcoind...');

      const args = [
        `-${this.config.network}`,
        '-daemon',
        `-rpcuser=${this.config.rpcUser}`,
        `-rpcpassword=${this.config.rpcPassword}`,
        `-rpcport=${this.config.rpcPort}`,
        '-server',
        '-txindex',
        '-fallbackfee=0.00001',
      ];

      this.bitcoindProcess = spawn('bitcoind', args, {
        detached: true,
        stdio: 'ignore',
      });

      this.bitcoindProcess.unref();

      this.bitcoindProcess.on('error', (error) => {
        reject(new Error(`Failed to start bitcoind: ${error.message}`));
      });

      setTimeout(() => {
        void (async () => {
          const nowRunning = await this.isBitcoindRunning();
          if (nowRunning) {
            this.log('bitcoind started');
            resolve();
          } else {
            reject(new Error('bitcoind started but not responding'));
          }
        })();
      }, 3000);
    });
  }

  async stopBitcoind(): Promise<void> {
    try {
      this.log('Stopping bitcoind...');
      await this.client.stop();
      this.log('bitcoind stopped');

      if (this.bitcoindProcess) {
        this.bitcoindProcess.kill();
        this.bitcoindProcess = null;
      }
    } catch {
      // Already stopped
    }
  }

  async setupWallet(): Promise<void> {
    try {
      await this.client.createWallet('regtest-wallet');
      this.log('Created wallet');
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === -4
      ) {
        await this.client.loadWallet('regtest-wallet');
        this.log('Loaded wallet');
      } else {
        throw error;
      }
    }

    this.walletAddress = await this.client.getNewAddress();
    this.log(`Wallet address: ${this.walletAddress}`);
  }

  getWalletAddress(): string {
    if (!this.walletAddress) {
      throw new Error('Wallet not initialized');
    }
    return this.walletAddress;
  }

  async getBalance(): Promise<number> {
    return await this.client.getBalance();
  }

  async mineBlocks(blocks: number, address?: string): Promise<string[]> {
    const targetAddress = address || this.getWalletAddress();
    this.log(`Mining ${blocks} block(s)...`);

    const blockHashes = await this.client.generateToAddress(
      blocks,
      targetAddress
    );

    return blockHashes;
  }

  private startAutoMining(): void {
    this.log(`Auto-mining enabled (${this.config.autoMineIntervalMs}ms)`);

    this.autoMineTimer = setInterval(() => {
      void (async () => {
        try {
          await this.mineBlocks(1);
          const height = await this.client.getBlockCount();
          this.log(`Block ${height} mined`);
        } catch (error) {
          console.error('Auto-mine error:', error);
        }
      })();
    }, this.config.autoMineIntervalMs);
  }

  private stopAutoMining(): void {
    if (this.autoMineTimer) {
      clearInterval(this.autoMineTimer);
      this.autoMineTimer = null;
      this.log('Auto-mining stopped');
    }
  }

  async fundAddress(address: string, amount: number): Promise<string> {
    const currentBalance = await this.getBalance();
    if (currentBalance < amount) {
      this.log(`Mining blocks for funds...`);
      await this.mineBlocks(this.config.autoMineInitialBlocks);
    }

    const txid = await this.client.sendToAddress(address, amount);
    this.log(`Sent ${amount} BTC to ${address}`);

    await this.mineBlocks(1);

    return txid;
  }

  async getBlockCount(): Promise<number> {
    return await this.client.getBlockCount();
  }

  async getTransaction(txid: string): Promise<BitcoinTransaction> {
    return await this.client.getTransaction(txid);
  }

  async listTransactions(
    count: number = 10
  ): Promise<BitcoinTransactionListItem[]> {
    return await this.client.listTransactions('*', count);
  }

  async start(): Promise<void> {
    this.log('Initializing Bitcoin Regtest...');

    await this.startBitcoind();
    await this.setupWallet();

    const balance = await this.getBalance();
    if (balance === 0) {
      this.log('Mining initial blocks...');
      await this.mineBlocks(this.config.autoMineInitialBlocks);
    }

    this.startAutoMining();

    const finalBalance = await this.getBalance();
    const blockHeight = await this.getBlockCount();

    this.log('Bitcoin Regtest ready', {
      address: this.walletAddress,
      balance: finalBalance,
      blockHeight,
    });
  }

  async shutdown(): Promise<void> {
    this.log('Shutting down...');
    this.stopAutoMining();
    await this.stopBitcoind();
    this.log('Shutdown complete');
  }

  getClient(): BitcoinRpcClient {
    return this.client;
  }
}
