# bitcoin-regtest

[![npm version](https://img.shields.io/npm/v/bitcoin-regtest.svg)](https://www.npmjs.com/package/bitcoin-regtest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Zero-config Bitcoin regtest environment with auto-mining for local development and testing.

## Installation

```bash
npm install bitcoin-regtest
# or
yarn add bitcoin-regtest
```

**Prerequisites:** Bitcoin Core must be installed on your system.

```bash
# macOS
brew install bitcoin

# Ubuntu/Debian
sudo apt-get install bitcoind
```

## Quick Start

### CLI

```bash
npx bitcoin-regtest
```

Starts bitcoind in regtest mode, creates a wallet, mines 101 initial blocks, and auto-mines every 10 seconds.

### Programmatic Usage

```typescript
import { BitcoinRegtestManager } from 'bitcoin-regtest';

const manager = new BitcoinRegtestManager();
await manager.start();

// Get wallet address and balance
const address = await manager.getWalletAddress();
const balance = await manager.getBalance();

// Fund an address
await manager.fundAddress('bcrt1q...', 10);

// Mine blocks
await manager.mineBlocks(6);

// Cleanup
await manager.shutdown();
```

### Custom Configuration

All options are optional with sensible defaults:

```typescript
const manager = new BitcoinRegtestManager({
  rpcPort: 18443,
  rpcHost: 'localhost',
  rpcUser: 'test',
  rpcPassword: 'test123',
  autoMineIntervalMs: 10000,
  autoMineInitialBlocks: 101
});

await manager.start();
```

### Integration Testing

```typescript
import { BitcoinRegtestManager } from 'bitcoin-regtest';
import { describe, it, before, after } from 'mocha';

describe('Bitcoin Integration Tests', () => {
  let regtest: BitcoinRegtestManager;

  before(async () => {
    regtest = new BitcoinRegtestManager();
    await regtest.start();
  });

  after(async () => {
    await regtest.shutdown();
  });

  it('should fund address', async () => {
    await regtest.fundAddress('bcrt1q...', 5);
    const height = await regtest.getBlockCount();
    expect(height).to.be.greaterThan(101);
  });
});
```

## API Reference

### Constructor

```typescript
new BitcoinRegtestManager(config?: PartialBitcoinRegtestConfig)
```

Creates a new manager instance. All configuration options are optional.

**Configuration Options:**
- `rpcHost`: string (default: `'localhost'`)
- `rpcPort`: number (default: `18443`)
- `rpcUser`: string (default: `'test'`)
- `rpcPassword`: string (default: `'test123'`)
- `autoMineInitialBlocks`: number (default: `101`)
- `autoMineIntervalMs`: number (default: `10000`)

### Methods

#### `start(): Promise<void>`

Starts bitcoind, creates wallet, mines initial blocks, and enables auto-mining.

#### `shutdown(): Promise<void>`

Stops auto-mining and bitcoind daemon.

#### `getWalletAddress(): Promise<string>`

Returns the regtest wallet's Bitcoin address.

#### `getBalance(): Promise<number>`

Returns wallet balance in BTC.

#### `mineBlocks(count: number, address?: string): Promise<string[]>`

Mines blocks. Returns array of block hashes.

**Parameters:**
- `count`: Number of blocks to mine
- `address`: Optional address for mining rewards (defaults to wallet address)

#### `fundAddress(address: string, amount: number): Promise<string>`

Sends BTC to an address and mines 1 confirmation block.

**Parameters:**
- `address`: Recipient Bitcoin address
- `amount`: Amount in BTC

**Returns:** Transaction ID

#### `getBlockCount(): Promise<number>`

Returns current blockchain height.

#### `getTransaction(txid: string): Promise<any>`

Returns transaction details.

#### `listTransactions(count?: number): Promise<any[]>`

Lists recent wallet transactions.

**Parameters:**
- `count`: Number of transactions (default: 10)

#### `getClient(): Client`

Returns raw `bitcoin-core` RPC client for advanced operations. See [bitcoin-core npm package](https://www.npmjs.com/package/bitcoin-core) for full RPC API.

## Default Configuration

| Setting                | Value       | Description                     |
| ---------------------- | ----------- | ------------------------------- |
| RPC Host               | `localhost` | Bitcoin RPC server host         |
| RPC Port               | `18443`     | Standard regtest port           |
| RPC User               | `test`      | RPC authentication username     |
| RPC Password           | `test123`   | RPC authentication password     |
| Initial Blocks         | `101`       | Mined at startup                |
| Auto-mine Interval     | `10000ms`   | Mines 1 block every 10 seconds  |

**Why 101 blocks?** Bitcoin requires 100 confirmations before coinbase rewards can be spent.

## Troubleshooting

### "bitcoind not found"

```bash
# macOS
brew install bitcoin

# Ubuntu/Debian
sudo apt-get install bitcoind
```

### "Address already in use" (port 18443)

```bash
pkill bitcoind
# or
bitcoin-cli -regtest stop
```

### Wallet errors

```bash
# macOS
rm -rf ~/Library/Application\ Support/Bitcoin/regtest

# Linux
rm -rf ~/.bitcoin/regtest
```

## Requirements

- Node.js >= 18.0.0
- Bitcoin Core

## License

MIT

## Repository

[https://github.com/Pessina/bitcoin-regtest](https://github.com/Pessina/bitcoin-regtest)
