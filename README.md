# bitcoin-regtest

[![npm version](https://img.shields.io/npm/v/bitcoin-regtest.svg)](https://www.npmjs.com/package/bitcoin-regtest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Zero-config Bitcoin regtest environment with auto-mining. Perfect for local development and testing Bitcoin applications without manually managing bitcoind.

## Features

- ✅ **Auto-start bitcoind** - Automatically starts/stops local regtest daemon
- ✅ **Auto-mining** - Mines blocks every 10 seconds (configurable)
- ✅ **Zero config** - Everything hardcoded, just run it
- ✅ **TypeScript** - Full type definitions included
- ✅ **Programmatic API** - Use in tests or development servers
- ✅ **Standalone CLI** - Can run as a background service

## Installation

```bash
npm install bitcoin-regtest
# or
yarn add bitcoin-regtest
```

## Prerequisites

Install Bitcoin Core on your system:

```bash
# macOS
brew install bitcoin

# Ubuntu/Debian
sudo apt-get install bitcoind

# Verify installation
bitcoind --version
```

## Quick Start

### Standalone Server (CLI)

Run as a standalone server for local development:

```bash
# If installed globally
npx bitcoin-regtest

# Or with yarn in a monorepo
yarn workspace bitcoin-regtest start
```

This will:

1. Start bitcoind in regtest mode on port 18443
2. Create a Bitcoin wallet named "regtest-wallet"
3. Mine 101 initial blocks (required for coinbase maturity)
4. Auto-mine 1 block every 10 seconds
5. Keep running until you stop it (Ctrl+C)

Output:

```
🚀 Starting Bitcoin Regtest...
✅ bitcoind started (PID: 12345)
✅ Loaded wallet
✅ Mined 101 initial blocks
⏰ Auto-mining enabled (10000ms)
📍 Wallet address: bcrt1q...
💰 Balance: 50.00000000 BTC
🎯 Bitcoin Regtest ready! RPC: http://localhost:18443
  Block 102 mined
  Block 103 mined
  ...
```

### Programmatic Usage

Use in your TypeScript/JavaScript code:

```typescript
import { start } from 'bitcoin-regtest';

async function setupBitcoinRegtest() {
  // Start regtest (auto-mines every 10s)
  const manager = await start();

  // Get wallet address
  const address = await manager.getWalletAddress();
  console.log('Regtest wallet address:', address);

  // Get current balance
  const balance = await manager.getBalance();
  console.log('Balance:', balance, 'BTC');

  // Fund another address (automatically mines 1 block for confirmation)
  await manager.fundAddress('bcrt1q...', 10); // 10 BTC

  // Manually mine blocks when needed
  await manager.mineBlocks(6); // Mine 6 blocks

  // Get transaction details
  const tx = await manager.getTransaction('a1b2c3...');
  console.log('Transaction confirmations:', tx.confirmations);

  // List recent transactions
  const transactions = await manager.listTransactions(10);
  console.log('Recent transactions:', transactions);

  // Get current block height
  const height = await manager.getBlockCount();
  console.log('Current height:', height);

  // Access raw RPC client for advanced operations
  const client = manager.getClient();
  const info = await client.getBlockchainInfo();

  // Cleanup when done (stops auto-mining and bitcoind)
  await manager.shutdown();
}

setupBitcoinRegtest();
```

### In Tests

Perfect for integration testing:

```typescript
import { start } from 'bitcoin-regtest';
import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';

describe('Bitcoin Integration Tests', () => {
  let regtest;
  let testAddress;

  before(async () => {
    // Start regtest before all tests
    regtest = await start();
    testAddress = await regtest.getWalletAddress();
  });

  after(async () => {
    // Clean up after all tests
    await regtest.shutdown();
  });

  it('should fund address and confirm transaction', async () => {
    const recipientAddress = 'bcrt1q...';

    // Fund address (auto-mines 1 block)
    await regtest.fundAddress(recipientAddress, 5);

    // Verify block was mined
    const height = await regtest.getBlockCount();
    expect(height).to.be.greaterThan(101);
  });

  it('should mine blocks on demand', async () => {
    const initialHeight = await regtest.getBlockCount();

    await regtest.mineBlocks(6);

    const newHeight = await regtest.getBlockCount();
    expect(newHeight).to.equal(initialHeight + 6);
  });
});
```

### With Other Bitcoin Libraries

Integrate with bitcoinjs-lib for transaction building:

```typescript
import { start } from 'bitcoin-regtest';
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';

const ECPair = ECPairFactory(ecc);

async function buildAndBroadcastTransaction() {
  const regtest = await start();

  // Generate a keypair
  const keyPair = ECPair.makeRandom({ network: bitcoin.networks.regtest });
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network: bitcoin.networks.regtest,
  });

  // Fund the address
  await regtest.fundAddress(address!, 10);

  // Build transaction
  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.regtest });

  // Use regtest RPC to get UTXOs and build transaction
  const client = regtest.getClient();
  const utxos = await client.listUnspent();

  psbt.addInput({
    hash: utxos[0].txid,
    index: utxos[0].vout,
    // ... other input data
  });

  psbt.addOutput({
    address: 'bcrt1q...',
    value: 50000000, // 0.5 BTC in satoshis
  });

  // Sign and broadcast
  psbt.signAllInputs(keyPair);
  psbt.finalizeAllInputs();

  const txHex = psbt.extractTransaction().toHex();
  const txid = await client.sendRawTransaction(txHex);

  console.log('Transaction broadcast:', txid);

  // Mine a block to confirm
  await regtest.mineBlocks(1);

  await regtest.shutdown();
}
```

## API Reference

### `start()`

Starts the Bitcoin regtest environment.

```typescript
import { start } from 'bitcoin-regtest';

const manager = await start();
```

**Returns**: `Promise<BitcoinRegtestManager>`

**What it does:**

1. Starts bitcoind in regtest mode
2. Creates/loads wallet "regtest-wallet"
3. Mines 101 initial blocks (for coinbase maturity)
4. Enables auto-mining (1 block every 10 seconds)

### BitcoinRegtestManager

Main manager class for controlling regtest environment.

#### `getWalletAddress(): Promise<string>`

Get the regtest wallet's Bitcoin address.

```typescript
const address = await manager.getWalletAddress();
// Returns: "bcrt1q..."
```

#### `getBalance(): Promise<number>`

Get the wallet's current balance in BTC.

```typescript
const balance = await manager.getBalance();
// Returns: 50.0 (after initial 101 blocks)
```

#### `mineBlocks(count: number, address?: string): Promise<string[]>`

Manually mine blocks.

```typescript
// Mine 6 blocks to regtest wallet
const blockHashes = await manager.mineBlocks(6);

// Mine to specific address
const hashes = await manager.mineBlocks(6, 'bcrt1q...');
```

**Parameters:**

- `count` - Number of blocks to mine
- `address` - Optional address to receive mining rewards (defaults to wallet address)

**Returns**: Array of block hashes

#### `fundAddress(address: string, amount: number): Promise<string>`

Send BTC to an address and automatically mine 1 block for confirmation.

```typescript
const txid = await manager.fundAddress('bcrt1q...', 10);
// Sends 10 BTC and mines 1 block
```

**Parameters:**

- `address` - Recipient Bitcoin address
- `amount` - Amount in BTC

**Returns**: Transaction ID

#### `getBlockCount(): Promise<number>`

Get current blockchain height.

```typescript
const height = await manager.getBlockCount();
// Returns: 102 (after initial setup)
```

#### `getTransaction(txid: string): Promise<any>`

Get transaction details by txid.

```typescript
const tx = await manager.getTransaction('a1b2c3...');
console.log(tx.confirmations); // Number of confirmations
```

#### `listTransactions(count?: number): Promise<any[]>`

List recent wallet transactions.

```typescript
const transactions = await manager.listTransactions(10);
// Returns last 10 transactions
```

**Parameters:**

- `count` - Number of transactions to return (default: 10)

#### `getClient(): any`

Get raw `bitcoin-core` RPC client for advanced operations.

```typescript
const client = manager.getClient();
const info = await client.getBlockchainInfo();
const mempool = await client.getRawMempool();
```

See [bitcoin-core npm package](https://www.npmjs.com/package/bitcoin-core) for full RPC API.

#### `shutdown(): Promise<void>`

Stop auto-mining and bitcoind daemon. Always call this when done.

```typescript
await manager.shutdown();
```

## Configuration

All configuration is hardcoded for zero-config operation:

| Setting                | Value       | Description                              |
| ---------------------- | ----------- | ---------------------------------------- |
| **RPC Host**           | `localhost` | Bitcoin RPC server host                  |
| **RPC Port**           | `18443`     | Standard regtest port                    |
| **RPC User**           | `test`      | RPC authentication username              |
| **RPC Password**       | `test123`   | RPC authentication password              |
| **Network**            | `regtest`   | Bitcoin network mode                     |
| **Initial Blocks**     | `101`       | Mined at startup (for coinbase maturity) |
| **Auto-mining**        | `enabled`   | Automatically mines blocks               |
| **Auto-mine Interval** | `10000ms`   | Mines 1 block every 10 seconds           |

**Why 101 blocks?**
Bitcoin requires 100 confirmations before coinbase rewards can be spent. Mining 101 blocks ensures the wallet has spendable BTC immediately.

## Use Cases

### 1. Local Development

Run regtest alongside your Bitcoin application for instant feedback:

```bash
# Terminal 1: Start regtest
npx bitcoin-regtest

# Terminal 2: Run your app
npm run dev
```

Your app connects to `http://localhost:18443` with credentials `test:test123`.

### 2. Integration Testing

Test Bitcoin transaction flows without testnet wait times:

```typescript
import { start } from 'bitcoin-regtest';

describe('Bitcoin Payment Flow', () => {
  let regtest;

  beforeAll(async () => {
    regtest = await start();
  });

  afterAll(async () => {
    await regtest.shutdown();
  });

  it('should process payment within seconds', async () => {
    const payment = await createPayment();
    await regtest.mineBlocks(6); // Instant confirmations
    expect(await payment.isConfirmed()).toBe(true);
  });
});
```

### 3. MPC/Multi-Sig Wallet Development

Test MPC signing without broadcasting to testnet:

```typescript
import { start } from 'bitcoin-regtest';

const regtest = await start();

// Build and sign PSBT
const psbt = buildPSBT();
await signWithMPC(psbt);

// Broadcast to local regtest
const client = regtest.getClient();
const txid = await client.sendRawTransaction(psbt.extractTransaction().toHex());

// Mine block for instant confirmation
await regtest.mineBlocks(1);
```

### 4. Bitcoin Adapter Testing

Perfect for testing Bitcoin RPC adapters:

```typescript
import { start } from 'bitcoin-regtest';
import { BitcoinCoreRpcAdapter } from 'fakenet-signer';

const regtest = await start();

// Use with your Bitcoin adapter
const adapter = BitcoinCoreRpcAdapter.createRegtestAdapter();

const tx = await adapter.getTransaction('txid...');
const utxos = await adapter.getAddressUtxos('bcrt1q...');
const txid = await adapter.broadcastTransaction(signedTxHex);

await regtest.mineBlocks(1); // Confirm transaction
```

## Integration Examples

### With Bitcoin Core RPC Clients

Any Bitcoin RPC client can connect to regtest:

```typescript
// Using bitcoin-core package
import Client from 'bitcoin-core';

const client = new Client({
  host: 'localhost',
  port: 18443,
  username: 'test',
  password: 'test123',
  network: 'regtest',
});

const info = await client.getBlockchainInfo();
```

### With Web Frameworks (Express Example)

```typescript
import express from 'express';
import { start } from 'bitcoin-regtest';

const app = express();
let regtest;

app.listen(3000, async () => {
  regtest = await start();
  console.log('Server running with Bitcoin regtest');
});

app.get('/fund/:address', async (req, res) => {
  const txid = await regtest.fundAddress(req.params.address, 1);
  res.json({ txid });
});

process.on('SIGINT', async () => {
  await regtest.shutdown();
  process.exit(0);
});
```

### With Docker Compose

```yaml
# docker-compose.yml
services:
  bitcoin-regtest:
    image: node:18
    command: npx bitcoin-regtest
    ports:
      - '18443:18443'
    volumes:
      - bitcoin-data:/root/.bitcoin

  your-app:
    build: .
    environment:
      BITCOIN_RPC_URL: http://bitcoin-regtest:18443
      BITCOIN_RPC_USER: test
      BITCOIN_RPC_PASSWORD: test123
    depends_on:
      - bitcoin-regtest

volumes:
  bitcoin-data:
```

## Troubleshooting

### "bitcoind not found"

**Problem**: bitcoind binary not in PATH

**Solution**:

```bash
# macOS
brew install bitcoin

# Ubuntu/Debian
sudo apt-get install bitcoind

# Verify
bitcoind --version
```

### "Cannot connect to Bitcoin RPC"

**Problem**: bitcoind not running or wrong port

**Solution**:

```bash
# Check if bitcoind is running
ps aux | grep bitcoind

# Test RPC connection
bitcoin-cli -regtest -rpcuser=test -rpcpassword=test123 getblockchaininfo

# Check port 18443 is free
lsof -i :18443
```

### "Address already in use" (port 18443)

**Problem**: Another bitcoind instance is running

**Solution**:

```bash
# Find and kill existing bitcoind
pkill bitcoind

# Or stop it gracefully
bitcoin-cli -regtest stop

# Wait a few seconds, then restart
```

### Wallet creation errors

**Problem**: Corrupted wallet or data directory

**Solution**:

```bash
# macOS
rm -rf ~/Library/Application\ Support/Bitcoin/regtest

# Linux
rm -rf ~/.bitcoin/regtest

# Then restart bitcoin-regtest
```

### "Insufficient funds" errors

**Problem**: Wallet doesn't have spendable BTC yet

**Solution**:
Wait for auto-mining to generate initial blocks (101 blocks = ~17 minutes at 10s intervals), or mine manually:

```typescript
const regtest = await start();
await regtest.mineBlocks(101); // Mine all at once
```

### TypeScript errors when importing

**Problem**: Missing type definitions

**Solution**:

```bash
npm install --save-dev @types/node
```

## How It Works

1. **Startup**: Spawns `bitcoind` process in regtest mode
2. **Wallet**: Creates/loads a wallet named "regtest-wallet"
3. **Initial Mining**: Mines 101 blocks to have spendable coinbase rewards
4. **Auto-mining**: Runs interval timer that mines 1 block every 10 seconds
5. **Shutdown**: Stops auto-mining interval and kills bitcoind process

### Directory Structure

```
bitcoin-regtest/
├── src/
│   ├── BitcoinRegtestManager.ts    # Main manager class
│   ├── config.ts                    # Hardcoded configuration
│   ├── index.ts                     # Public API exports
│   └── types/bitcoin-core.d.ts      # TypeScript definitions
├── dist/                            # Compiled JavaScript (not in repo)
├── package.json
├── tsconfig.json
└── README.md
```

## Publishing

### For Package Maintainers

#### Beta Release

```bash
cd clients/bitcoin-regtest
yarn publish:beta
```

This will:

1. Bump to next beta version (e.g., `1.0.0` → `1.0.1-beta.0`)
2. Build the package
3. Publish to npm with `@beta` tag

#### Official Release

```bash
cd clients/bitcoin-regtest

# Patch (bug fixes): 1.0.0 → 1.0.1
yarn version:patch && yarn publish:official

# Minor (new features): 1.0.0 → 1.1.0
yarn version:minor && yarn publish:official

# Major (breaking changes): 1.0.0 → 2.0.0
yarn version:major && yarn publish:official
```

## Requirements

- **Node.js**: 18.0.0 or higher
- **Bitcoin Core**: Latest version recommended
  - macOS: `brew install bitcoin`
  - Ubuntu/Debian: `sudo apt-get install bitcoind`
  - Windows: Download from [bitcoin.org](https://bitcoin.org/en/download)

## Related Packages

- [bitcoin-core](https://www.npmjs.com/package/bitcoin-core) - Bitcoin Core RPC client (used internally)
- [bitcoinjs-lib](https://www.npmjs.com/package/bitcoinjs-lib) - Bitcoin transaction building
- [fakenet-signer](https://www.npmjs.com/package/fakenet-signer) - Multi-chain MPC signature orchestrator with Bitcoin support

## Contributing

Contributions welcome! This package is part of the [signet-solana-program](https://github.com/sig-net/signet-solana-program) monorepo.

## License

MIT

## Support

- Issues: [GitHub Issues](https://github.com/sig-net/signet-solana-program/issues)
- Repository: [signet-solana-program](https://github.com/sig-net/signet-solana-program)
# bitcoin-regtest
