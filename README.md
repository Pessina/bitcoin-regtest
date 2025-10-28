# Bitcoin Regtest Explorer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bitcoin Core 30+](https://img.shields.io/badge/Bitcoin-Core_30+-orange?logo=bitcoin)](https://bitcoin.org)
[![Node.js 22+](https://img.shields.io/badge/Node.js-22+-green?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue?logo=typescript)](https://www.typescriptlang.org)

A complete Bitcoin regtest environment with a web-based blockchain explorer. Designed for local development and testing of Bitcoin applications without managing bitcoind manually.

## Features

### Core Functionality
- **Auto-mining**: Automatic block generation every 10 seconds (configurable)
- **Web Explorer**: Full-featured blockchain explorer UI
- **Programmatic API**: BitcoinRegtestManager for integration testing
- **RPC Proxy**: HTTP server proxies requests to bitcoind
- **Docker Support**: Single-container deployment

### Web Explorer
- Real-time blockchain statistics and difficulty tracking
- Block explorer with transaction details
- Address viewer with balance, UTXOs, and transaction history
- Mempool monitoring with unconfirmed transactions
- Fee estimation (low/medium/high priority)
- Transaction broadcasting interface
- Test faucet for funding addresses
- Smart search (addresses, transactions, blocks)
- Script type identification (P2TR, P2WPKH, P2PKH, P2SH, P2WSH)
- SegWit and RBF transaction detection
- QR code generation for addresses

## Prerequisites

**Docker (Recommended):**
- Docker Engine or Docker Desktop
- Docker Compose

**Local Development:**
- Node.js >= 22.0
- Yarn >= 1.22
- Bitcoin Core >= 30.0

## Quick Start

### Docker

```bash
git clone https://github.com/Pessina/bitcoin-regtest.git
cd bitcoin-regtest
yarn docker:dev
```

Access the explorer at http://localhost:5173

### Local Development

```bash
git clone https://github.com/Pessina/bitcoin-regtest.git
cd bitcoin-regtest
yarn install
yarn build
yarn start
```

**Endpoints:**
- Web UI: http://localhost:5173
- Bitcoin RPC: localhost:18443
- RPC Credentials: `test` / `test123`

## Project Structure

```
bitcoin-regtest/
├── packages/
│   ├── server/                      # Bitcoin regtest manager
│   │   ├── src/
│   │   │   ├── BitcoinRegtestManager.ts
│   │   │   ├── server.ts           # HTTP server & RPC proxy
│   │   │   ├── cli.ts
│   │   │   └── types.ts
│   │   └── package.json
│   └── web/                         # React explorer UI
│       ├── src/
│       │   ├── components/         # React components
│       │   ├── lib/
│       │   │   ├── api.ts          # Bitcoin RPC client
│       │   │   └── timeUtils.ts
│       │   └── App.tsx
│       └── package.json
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## API Usage

### BitcoinRegtestManager

Core class for managing the Bitcoin regtest environment.

```typescript
import { BitcoinRegtestManager } from '@bitcoin-regtest/server';

const manager = new BitcoinRegtestManager(config?);
```

#### Configuration

```typescript
interface BitcoinRegtestConfig {
  rpcHost?: string;              // Default: 'localhost'
  rpcPort?: number;              // Default: 18443
  rpcUser?: string;              // Default: 'test'
  rpcPassword?: string;          // Default: 'test123'
  network?: string;              // Default: 'regtest'
  autoMineInitialBlocks?: number; // Default: 101
  autoMineIntervalMs?: number;    // Default: 10000
}
```

#### Methods

**start(): Promise<void>**

Starts bitcoind and begins auto-mining.

```typescript
await manager.start();
```

**shutdown(): Promise<void>**

Stops bitcoind and auto-mining.

```typescript
await manager.shutdown();
```

**getWalletAddress(): string**

Returns the default wallet address.

```typescript
const address = manager.getWalletAddress();
```

**mineBlocks(count: number): Promise<void>**

Mines the specified number of blocks.

```typescript
await manager.mineBlocks(5);
```

**fundAddress(address: string, amount: number): Promise<string>**

Sends BTC to an address and mines 1 confirmation block. Returns transaction ID.

```typescript
const txid = await manager.fundAddress('bcrt1q...', 1.5);
```

**getClient(): BitcoinClient**

Returns the Bitcoin Core RPC client for full API access.

```typescript
const client = manager.getClient();
const height = await client.getBlockCount();
const balance = await client.getBalance();
```

See [bitcoin-core documentation](https://github.com/ruimarinho/bitcoin-core) for complete RPC API.

## Integration Testing Example

```typescript
import { BitcoinRegtestManager } from '@bitcoin-regtest/server';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

describe('Bitcoin Integration Tests', () => {
  let manager: BitcoinRegtestManager;

  beforeAll(async () => {
    manager = new BitcoinRegtestManager({
      autoMineIntervalMs: 5000
    });
    await manager.start();
  });

  afterAll(async () => {
    await manager.shutdown();
  });

  it('should fund address and confirm transaction', async () => {
    const address = 'bcrt1q...';
    const txid = await manager.fundAddress(address, 1.5);

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

## Architecture

The system runs in a single Docker container with three components:

1. **Bitcoin Core (v30)**: Regtest network on port 18443
2. **HTTP Server**: Serves static files and proxies `/rpc` to bitcoind
3. **BitcoinRegtestManager**: Manages bitcoind lifecycle and auto-mining

**Data Flow:**
1. Browser loads React application
2. React calls API endpoints (`/rpc`)
3. Server proxies requests to bitcoind (port 18443)
4. bitcoind processes and returns data
5. React updates UI

## Development

### Available Commands

```bash
# Build
yarn build                    # Build all packages
yarn build:watch              # Build in watch mode
yarn clean                    # Remove build artifacts

# Development
yarn start                    # Start server
yarn type-check               # TypeScript type checking
yarn lint                     # Lint code
yarn lint:fix                 # Fix linting issues
yarn format                   # Format with Prettier

# Docker
yarn docker:dev               # Build and run
yarn docker:build             # Build image
yarn docker:up                # Start containers
yarn docker:down              # Stop containers
yarn docker:logs              # View logs
yarn docker:clean             # Remove containers and volumes

# Package-specific
yarn workspace @bitcoin-regtest/server build
yarn workspace @bitcoin-regtest/server start
yarn workspace @bitcoin-regtest/web build
yarn workspace @bitcoin-regtest/web dev
```

### Development Workflow

**Server changes:**
```bash
# Terminal 1
yarn workspace @bitcoin-regtest/server build:watch

# Terminal 2
yarn start
```

**Web UI changes:**
```bash
# Terminal 1
yarn workspace @bitcoin-regtest/web dev

# Terminal 2
yarn start

# Access: http://localhost:5173
```

## Troubleshooting

### Port Already in Use

```bash
# Stop bitcoind
bitcoin-cli -regtest stop

# Or kill process
pkill bitcoind

# Docker
yarn docker:down
```

### Reset Blockchain Data

**Local:**
```bash
# macOS
rm -rf ~/Library/Application\ Support/Bitcoin/regtest

# Linux
rm -rf ~/.bitcoin/regtest

# Windows
rmdir /s %APPDATA%\Bitcoin\regtest
```

**Docker:**
```bash
yarn docker:clean
```

### Build Errors

```bash
yarn clean
rm -rf node_modules packages/*/node_modules
yarn install
yarn build
```

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/name`)
3. Follow the code style:
   - Run `yarn format` before committing
   - Ensure `yarn type-check` passes
   - Ensure `yarn build` succeeds
4. Write clear commit messages using [Conventional Commits](https://www.conventionalcommits.org/)
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- [GitHub Repository](https://github.com/Pessina/bitcoin-regtest)
- [Issue Tracker](https://github.com/Pessina/bitcoin-regtest/issues)
- [Bitcoin Core Documentation](https://bitcoin.org/en/bitcoin-core/)
- [Bitcoin Core RPC API](https://github.com/ruimarinho/bitcoin-core)

## Tech Stack

- [Bitcoin Core](https://bitcoin.org/en/bitcoin-core/) - Bitcoin reference implementation
- [bitcoin-core](https://github.com/ruimarinho/bitcoin-core) - Bitcoin RPC client for Node.js
- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [TanStack Query](https://tanstack.com/query) - Data synchronization
- [Vite](https://vitejs.dev/) - Build tool
