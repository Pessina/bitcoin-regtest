import Client from 'bitcoin-core';
import { ChildProcess, spawn } from 'child_process';

import {
  BitcoinRegtestConfig,
  mergeConfig,
  PartialBitcoinRegtestConfig,
} from './config';
import { BitcoinRpcClient } from './types';

/**
 * Manages a Bitcoin regtest environment with automatic mining and wallet management.
 * Provides a simple API for testing Bitcoin applications locally.
 */
export class BitcoinRegtestManager {
  private client: BitcoinRpcClient;
  private config: BitcoinRegtestConfig;
  private bitcoindProcess: ChildProcess | null = null;
  private walletAddress: string | null = null;
  private autoMineTimer: NodeJS.Timeout | null = null;

  /**
   * Create a new Bitcoin Regtest Manager.
   *
   * @param config - Optional configuration to override defaults
   *
   * @example
   * ```typescript
   * // Use default configuration
   * const manager = new BitcoinRegtestManager();
   *
   * // Custom configuration
   * const manager = new BitcoinRegtestManager({
   *   rpcPort: 18444,
   *   autoMineIntervalMs: 5000,
   *   autoMineInitialBlocks: 200
   * });
   * ```
   */
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
        '-rpcbind=0.0.0.0',
        '-rpcallowip=0.0.0.0/0',
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

  /**
   * Get the wallet address for the regtest environment.
   * This address is created during the initial setup.
   *
   * @returns The wallet's Bitcoin address
   * @throws {Error} If the wallet has not been initialized yet
   *
   * @example
   * ```typescript
   * const manager = new BitcoinRegtestManager();
   * await manager.start();
   * const address = manager.getWalletAddress();
   * console.log(`Wallet address: ${address}`);
   * ```
   */
  getWalletAddress(): string {
    if (!this.walletAddress) {
      throw new Error('Wallet not initialized');
    }
    return this.walletAddress;
  }

  /**
   * Mine a specified number of blocks to an address.
   * If no address is provided, blocks are mined to the wallet address.
   *
   * @param blocks - Number of blocks to mine
   * @param address - Optional Bitcoin address to receive mining rewards. Defaults to wallet address.
   * @returns Array of block hashes for the newly mined blocks
   *
   * @example
   * ```typescript
   * // Mine 10 blocks to the wallet
   * const blockHashes = await manager.mineBlocks(10);
   *
   * // Mine 5 blocks to a specific address
   * const hashes = await manager.mineBlocks(5, 'bcrt1q...');
   * ```
   */
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

  /**
   * Fund a Bitcoin address with the specified amount.
   * This method will automatically mine blocks if the wallet doesn't have sufficient balance,
   * send the transaction, and mine one confirmation block.
   *
   * @param address - The Bitcoin address to send funds to
   * @param amount - Amount of BTC to send
   * @returns Transaction ID of the funding transaction
   *
   * @example
   * ```typescript
   * // Send 1.5 BTC to an address
   * const txid = await manager.fundAddress('bcrt1q...', 1.5);
   * console.log(`Transaction ID: ${txid}`);
   * ```
   */
  async fundAddress(address: string, amount: number): Promise<string> {
    const currentBalance = await this.client.getBalance();
    if (currentBalance < amount) {
      this.log(`Mining blocks for funds...`);
      await this.mineBlocks(this.config.autoMineInitialBlocks);
    }

    const txid = await this.client.sendToAddress(address, amount);
    this.log(`Sent ${amount} BTC to ${address}`);

    await this.mineBlocks(1);

    return txid;
  }

  /**
   * Start the Bitcoin regtest environment.
   * This will:
   * 1. Start bitcoind if not already running
   * 2. Create/load the wallet
   * 3. Mine initial blocks if wallet has zero balance
   * 4. Start auto-mining blocks at the configured interval
   *
   * @example
   * ```typescript
   * const manager = new BitcoinRegtestManager();
   * await manager.start();
   * // Environment is now ready to use
   * ```
   */
  async start(): Promise<void> {
    this.log('Initializing Bitcoin Regtest...');

    await this.startBitcoind();
    await this.setupWallet();

    const balance = await this.client.getBalance();
    if (balance === 0) {
      this.log('Mining initial blocks...');
      await this.mineBlocks(this.config.autoMineInitialBlocks);
    }

    this.startAutoMining();

    const finalBalance = await this.client.getBalance();
    const blockHeight = await this.client.getBlockCount();

    this.log('Bitcoin Regtest ready', {
      address: this.walletAddress,
      balance: finalBalance,
      blockHeight,
    });
  }

  /**
   * Gracefully shutdown the Bitcoin regtest environment.
   * This will stop auto-mining and shutdown bitcoind.
   *
   * @example
   * ```typescript
   * await manager.shutdown();
   * ```
   */
  async shutdown(): Promise<void> {
    this.log('Shutting down...');
    this.stopAutoMining();
    await this.stopBitcoind();
    this.log('Shutdown complete');
  }

  /**
   * Get the underlying bitcoin-core RPC client.
   * Use this to access the full Bitcoin Core RPC API directly.
   *
   * @returns The bitcoin-core client instance
   *
   * @see https://github.com/ruimarinho/bitcoin-core for full API documentation
   *
   * @example
   * ```typescript
   * const client = manager.getClient();
   *
   * // Access any Bitcoin Core RPC method
   * const blockCount = await client.getBlockCount();
   * const balance = await client.getBalance();
   * const transaction = await client.getTransaction(txid);
   * const transactions = await client.listTransactions('*', 10);
   *
   * // Create raw transactions
   * const rawTx = await client.createRawTransaction([...], {...});
   * ```
   */
  getClient(): BitcoinRpcClient {
    return this.client;
  }
}
