# Bitcoin Regtest Environment

Zero-config Bitcoin regtest with auto-mining and web explorer for local development and testing.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Summary

A single-container Bitcoin regtest environment that just works. Perfect for:
- 🧪 Integration testing Bitcoin applications
- 🛠️ Local development without running bitcoind manually
- 🎓 Learning Bitcoin development
- 🔬 Experimenting with Bitcoin transactions

**Features:**
- ⚡ Auto-mining every 10 seconds
- 🌐 Web explorer UI
- 🐳 Single Docker command deployment
- 📦 Programmatic API for testing
- 🔧 Zero configuration needed

## Installation

### Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/Pessina/bitcoin-regtest.git
cd bitcoin-regtest

# Build and run in one command
yarn docker:dev

# View logs
yarn docker:logs
```

**Access:**
- **Web UI:** http://localhost:5173
- **Bitcoin RPC:** localhost:18443

### Local Development

**Prerequisites:**
- Node.js >= 22.0
- Yarn >= 1.22
- Bitcoin Core >= 30.0 ([install](https://bitcoin.org/en/download))

```bash
# Install dependencies
yarn install

# Build packages
yarn build

# Start the server
yarn start
```

## How to Run

### Docker Commands

```bash
# Build and run (handles cleanup automatically)
yarn docker:dev

# Or step by step:
yarn docker:build        # Build image
yarn docker:run          # Run container
yarn docker:logs         # View logs
yarn docker:stop         # Stop container
yarn docker:clean        # Remove everything
```

### Local Development Commands

```bash
yarn build               # Build all packages
yarn build:watch         # Build in watch mode
yarn start               # Start server
yarn clean               # Clean build artifacts

# Code quality
yarn lint                # Lint code
yarn lint:fix            # Fix linting issues
yarn format              # Format code
yarn type-check          # Type checking
```

## API Reference

### BitcoinRegtestManager

The core class for managing the Bitcoin regtest environment.

```typescript
import { BitcoinRegtestManager } from '@bitcoin-regtest/server';

const manager = new BitcoinRegtestManager(config?);
```

#### Configuration Options

```typescript
interface BitcoinRegtestConfig {
  rpcHost?: string;              // default: 'localhost'
  rpcPort?: number;              // default: 18443
  rpcUser?: string;              // default: 'test'
  rpcPassword?: string;          // default: 'test123'
  network?: string;              // default: 'regtest'
  autoMineInitialBlocks?: number; // default: 101
  autoMineIntervalMs?: number;    // default: 10000
}
```

#### Methods

**`async start(): Promise<void>`**
- Starts bitcoind and begins auto-mining
- Initializes wallet and mines initial blocks

**`async shutdown(): Promise<void>`**
- Stops bitcoind gracefully
- Stops auto-mining

**`getWalletAddress(): string`**
- Returns the default wallet address
- Available after `start()` completes

**`async mineBlocks(count: number): Promise<void>`**
- Mines specified number of blocks
- Useful for testing confirmations

**`async fundAddress(address: string, amount: number): Promise<string>`**
- Sends BTC to an address and mines 1 confirmation block
- Returns transaction ID
- Amount in BTC (e.g., 1.5 for 1.5 BTC)

**`getClient(): BitcoinClient`**
- Returns the Bitcoin Core RPC client
- Access full Bitcoin Core API
- See [bitcoin-core docs](https://github.com/ruimarinho/bitcoin-core)

## Example

### Integration Testing

```typescript
import { BitcoinRegtestManager } from '@bitcoin-regtest/server';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

describe('Bitcoin Integration Tests', () => {
  let manager: BitcoinRegtestManager;

  beforeAll(async () => {
    manager = new BitcoinRegtestManager();
    await manager.start();
  });

  afterAll(async () => {
    await manager.shutdown();
  });

  it('should fund address and confirm transaction', async () => {
    const address = 'bcrt1q...';

    // Fund address (automatically mines 1 block for confirmation)
    const txid = await manager.fundAddress(address, 1.5);

    // Verify transaction
    const client = manager.getClient();
    const tx = await client.getTransaction(txid);

    expect(tx.confirmations).toBeGreaterThan(0);
  });

  it('should mine blocks on demand', async () => {
    const client = manager.getClient();
    const initialHeight = await client.getBlockCount();

    await manager.mineBlocks(5);

    const newHeight = await client.getBlockCount();
    expect(newHeight).toBe(initialHeight + 5);
  });
});
```

### Standalone Script

```typescript
import { BitcoinRegtestManager } from '@bitcoin-regtest/server';

async function main() {
  const manager = new BitcoinRegtestManager();

  try {
    // Start environment
    await manager.start();
    console.log('Bitcoin regtest started!');

    // Get wallet address
    const address = manager.getWalletAddress();
    console.log('Wallet address:', address);

    // Access Bitcoin Core RPC client
    const client = manager.getClient();
    const blockCount = await client.getBlockCount();
    console.log('Current block height:', blockCount);

    // Mine some blocks
    await manager.mineBlocks(10);
    console.log('Mined 10 blocks');

    // Get balance
    const balance = await client.getBalance();
    console.log('Balance:', balance, 'BTC');

  } finally {
    await manager.shutdown();
  }
}

main();
```

## Architecture

```
┌─────────────────────┐
│   Web Browser       │
│   localhost:5173    │
└──────────┬──────────┘
           │ HTTP + /rpc proxy
           ↓
      ┌────────────────────┐
      │  Static Server     │
      │  - Serves web UI   │
      │  - Proxies /rpc    │
      └─────────┬──────────┘
                │
           ┌────▼─────┐
           │ bitcoind │
           │ :18443   │
           └────▲─────┘
                │
        ┌───────┴───────────┐
        │ BitcoinRegtest    │
        │ Manager           │
        └───────────────────┘
```

**Single container in Docker** - All components run together.

## Troubleshooting

### Port already in use

```bash
# Stop bitcoind
bitcoin-cli -regtest stop

# Or kill process
pkill bitcoind
```

### Reset blockchain data

```bash
# macOS
rm -rf ~/Library/Application\ Support/Bitcoin/regtest

# Linux
rm -rf ~/.bitcoin/regtest

# Docker
yarn docker:clean
```

## Contributing

Contributions welcome! Please submit a Pull Request.

## License

MIT

## Links

- [GitHub Repository](https://github.com/Pessina/bitcoin-regtest)
- [Bitcoin Core RPC API](https://github.com/ruimarinho/bitcoin-core)
- [Bitcoin Core Documentation](https://bitcoin.org/en/bitcoin-core/)
