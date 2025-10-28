# Bitcoin Regtest Explorer

<div align="center">

![Bitcoin](https://img.shields.io/badge/Bitcoin-Core_30+-orange?logo=bitcoin)
![Node](https://img.shields.io/badge/Node.js-22+-green?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

**Zero-config Bitcoin regtest environment with a beautiful web explorer for local development and testing.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

A complete Bitcoin regtest environment in a single container with a professional web explorer UI. Perfect for developers building Bitcoin applications who need a reliable local testing environment without the complexity of managing bitcoind manually.

**What makes this special:**
- 🚀 **Zero Configuration** - One command to start everything
- 🌐 **Beautiful Web Explorer** - Full-featured blockchain explorer UI
- ⚡ **Auto-Mining** - Blocks mined automatically every 10 seconds
- 🧪 **Testing Ready** - Programmatic API for integration tests
- 🐳 **Docker Ready** - Single container, no dependencies
- 🎨 **Modern UI** - Built with React, TypeScript, and Tailwind CSS

---

## ✨ Features

### 🌐 Web Explorer

A complete blockchain explorer with all the features you need:

#### Core Features
- 📊 **Real-time Dashboard** - Blockchain stats, difficulty, mempool info
- 🔍 **Smart Search** - Search addresses, transactions, or blocks
- 📦 **Block Explorer** - Browse blocks with full transaction details
- 💸 **Transaction History** - View all transactions with filters
- 👛 **Address Details** - Balance, UTXOs, transaction history
- 🎯 **Mempool View** - Live unconfirmed transactions

#### Advanced Features
- 💰 **Fee Recommendations** - Smart fee estimation (Low/Medium/High priority)
- ⛏️ **Difficulty Tracking** - Real-time difficulty adjustment progress
- 🔄 **RBF Detection** - Replace-By-Fee transaction badges
- ⚡ **SegWit Detection** - Visual indicators for SegWit transactions
- 🏷️ **Script Type Labels** - P2TR, P2WPKH, P2PKH, P2SH identification
- 📡 **Transaction Broadcast** - Submit raw transactions to network
- 💵 **Test Faucet** - Send test BTC to any address
- 🕐 **Time Ago Display** - Human-readable timestamps with tooltips
- 📱 **QR Codes** - Generate QR codes for addresses
- 📋 **Copy-to-Clipboard** - One-click copy for hashes and addresses

#### UI/UX
- 🎨 **Clean Light Theme** - Professional, easy-on-the-eyes design
- 🖱️ **Clickable Cards** - Direct navigation to details
- 🔄 **Auto-Refresh** - Real-time updates every 5-10 seconds
- 📊 **Sortable Lists** - Sort blocks and transactions (Newest/Oldest)
- 🎯 **Smart Filters** - Filter transactions (All/Normal/Rewards)
- 🏷️ **Badge System** - Visual indicators for transaction types
- 📱 **Responsive Design** - Works on all screen sizes

### 🛠️ Developer Tools

- **Programmatic API** - BitcoinRegtestManager class for testing
- **Auto-Mining** - Configurable interval (default: 10 seconds)
- **Quick Funding** - Fund any address with one function call
- **Block Control** - Mine blocks on demand
- **RPC Access** - Full Bitcoin Core RPC client access

---

## 🚀 Quick Start

### Prerequisites

**For Docker (Recommended):**
- Docker Desktop or Docker Engine
- Docker Compose

**For Local Development:**
- Node.js >= 22.0
- Yarn >= 1.22
- Bitcoin Core >= 30.0 ([download](https://bitcoin.org/en/download))

### Installation

#### Option 1: Docker (Easiest)

```bash
# Clone the repository
git clone https://github.com/Pessina/bitcoin-regtest.git
cd bitcoin-regtest

# Start everything with one command
yarn docker:dev

# Wait a few seconds, then open your browser
open http://localhost:5173
```

#### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/Pessina/bitcoin-regtest.git
cd bitcoin-regtest

# Install dependencies
yarn install

# Build all packages
yarn build

# Start the server (runs bitcoind and web server)
yarn start
```

**Access the Application:**
- 🌐 **Web Explorer**: http://localhost:5173
- 🔌 **Bitcoin RPC**: localhost:18443
- 🔑 **RPC Credentials**: `test` / `test123`

---

## 📚 Documentation

### Project Structure

```
bitcoin-regtest/
├── packages/
│   ├── server/              # Bitcoin regtest manager & HTTP server
│   │   ├── src/
│   │   │   ├── BitcoinRegtestManager.ts  # Core regtest logic
│   │   │   ├── server.ts                 # HTTP server with RPC proxy
│   │   │   ├── cli.ts                    # CLI entry point
│   │   │   └── types.ts                  # TypeScript interfaces
│   │   └── package.json
│   │
│   └── web/                 # React web explorer UI
│       ├── src/
│       │   ├── components/               # React components
│       │   │   ├── BlockList.tsx        # Block history list
│       │   │   ├── TransactionList.tsx  # Transaction history
│       │   │   ├── AddressDetails.tsx   # Address viewer
│       │   │   ├── BlockDetails.tsx     # Block details
│       │   │   ├── TransactionDetails.tsx
│       │   │   ├── MempoolView.tsx      # Unconfirmed transactions
│       │   │   ├── FeeRecommendations.tsx
│       │   │   ├── DifficultyAdjustment.tsx
│       │   │   └── ui/                  # shadcn/ui components
│       │   ├── lib/
│       │   │   ├── api.ts               # Bitcoin RPC API client
│       │   │   ├── timeUtils.ts         # Time formatting
│       │   │   └── utils.ts             # Utility functions
│       │   ├── App.tsx                  # Main application
│       │   └── main.tsx                 # Entry point
│       └── package.json
│
├── docker-compose.yml       # Docker configuration
├── Dockerfile              # Container image
├── package.json            # Monorepo configuration
└── tsconfig.base.json      # Shared TypeScript config
```

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Container                        │
│                                                              │
│  ┌──────────────────┐         ┌─────────────────────────┐  │
│  │   Web Browser    │         │   Bitcoin Core (v30)    │  │
│  │  localhost:5173  │◄────────┤   Regtest Network       │  │
│  └──────────────────┘         │   Port: 18443           │  │
│           │                   └─────────────────────────┘  │
│           │ HTTP                          ▲                │
│           ▼                               │                │
│  ┌──────────────────────────────────────┐│                │
│  │     Static HTTP Server               ││                │
│  │  - Serves React build                ││                │
│  │  - Proxies /rpc to bitcoind          ││                │
│  └──────────────────────────────────────┘│                │
│           ▲                               │                │
│           │                               │                │
│  ┌───────┴───────────────────────────────┴───────────┐    │
│  │        BitcoinRegtestManager                      │    │
│  │  - Manages bitcoind lifecycle                     │    │
│  │  - Auto-mining every 10 seconds                   │    │
│  │  - Provides programmatic API                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User interacts with React app in browser
2. React app makes API calls to `/rpc` endpoint
3. Server proxies requests to bitcoind RPC (port 18443)
4. bitcoind processes request and returns data
5. React app updates UI with real-time data

### Web Explorer Usage

#### Dashboard

The main dashboard shows:
- **Blockchain Statistics**: Height, difficulty, chain size
- **Difficulty Adjustment**: Progress to next retarget with prediction
- **Mempool Statistics**: Transaction count, size, fees
- **Fee Recommendations**: Smart fee estimates for different priorities
- **Block History**: Recent blocks with sorting (Newest/Oldest)
- **Transaction History**: Recent transactions with filters

#### Searching

The smart search bar automatically detects:
- **Bitcoin Addresses**: Legacy (1...), SegWit (bc1...)
- **Transaction IDs**: 64-character hex strings
- **Block Hashes**: 64-character hex strings

Just paste and press Enter!

#### Navigation

- **Click on blocks** → View block details and all transactions
- **Click on transactions** → View full transaction details
- **Click on addresses** → View balance, UTXOs, and history
- **Back button** → Return to explorer

#### Mempool Tab

View all unconfirmed transactions with:
- Real-time fee rates
- Transaction size
- SegWit detection
- Time since broadcast

#### Faucet Tab

Send test BTC to any address:
1. Enter recipient address
2. Enter amount (in BTC)
3. Click "Send Funds"
4. Transaction is broadcast and mined in ~10 seconds

---

## 🔧 API Reference

### BitcoinRegtestManager

The core class for managing the Bitcoin regtest environment.

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
  autoMineIntervalMs?: number;    // Default: 10000 (10 seconds)
}
```

#### Methods

##### `async start(): Promise<void>`
Starts bitcoind and begins auto-mining.

```typescript
await manager.start();
console.log('Bitcoin regtest is running!');
```

##### `async shutdown(): Promise<void>`
Stops bitcoind gracefully and stops auto-mining.

```typescript
await manager.shutdown();
```

##### `getWalletAddress(): string`
Returns the default wallet address (available after start).

```typescript
const address = manager.getWalletAddress();
console.log('Wallet:', address);
```

##### `async mineBlocks(count: number): Promise<void>`
Mines the specified number of blocks immediately.

```typescript
await manager.mineBlocks(5);
console.log('Mined 5 blocks');
```

##### `async fundAddress(address: string, amount: number): Promise<string>`
Sends BTC to an address and mines 1 confirmation block. Returns transaction ID.

```typescript
const txid = await manager.fundAddress('bcrt1q...', 1.5);
console.log('Funded with txid:', txid);
```

##### `getClient(): BitcoinClient`
Returns the Bitcoin Core RPC client for full API access.

```typescript
const client = manager.getClient();
const blockCount = await client.getBlockCount();
const balance = await client.getBalance();
```

See [bitcoin-core documentation](https://github.com/ruimarinho/bitcoin-core) for full RPC API.

---

## 💻 Development

### Available Scripts

#### Monorepo Commands

```bash
yarn build              # Build all packages
yarn build:watch        # Build in watch mode
yarn start              # Start the application
yarn clean              # Remove build artifacts
yarn type-check         # Run TypeScript type checking
yarn lint               # Lint all packages
yarn lint:fix           # Fix linting issues
yarn format             # Format code with Prettier
yarn format:check       # Check code formatting
```

#### Docker Commands

```bash
yarn docker:dev         # Build and run with cleanup
yarn docker:build       # Build Docker image
yarn docker:up          # Start containers
yarn docker:down        # Stop containers
yarn docker:stop        # Stop without removing
yarn docker:restart     # Restart containers
yarn docker:logs        # View logs (follow mode)
yarn docker:clean       # Remove everything (containers + volumes)
```

#### Package-Specific Commands

```bash
# Server package
yarn workspace @bitcoin-regtest/server build
yarn workspace @bitcoin-regtest/server start
yarn workspace @bitcoin-regtest/server type-check

# Web package
yarn workspace @bitcoin-regtest/web build
yarn workspace @bitcoin-regtest/web dev          # Start Vite dev server
yarn workspace @bitcoin-regtest/web type-check
```

### Development Workflow

#### Making Changes to the Server

```bash
# Terminal 1: Watch mode for automatic rebuilds
yarn workspace @bitcoin-regtest/server build:watch

# Terminal 2: Run the server
yarn start
```

#### Making Changes to the Web UI

```bash
# Terminal 1: Start dev server with hot reload
yarn workspace @bitcoin-regtest/web dev

# Terminal 2: Run the backend server
yarn start

# Open http://localhost:5173 (Vite dev server)
```

### Adding New Features

1. **Server Features** - Edit `packages/server/src/`
2. **UI Components** - Edit `packages/web/src/components/`
3. **API Methods** - Edit `packages/web/src/lib/api.ts`
4. **Styling** - Uses Tailwind CSS classes

### Code Style

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Components**: Functional React components with hooks
- **Styling**: Tailwind CSS utility classes
- **UI Components**: shadcn/ui component library

Run before committing:
```bash
yarn format
yarn lint
yarn type-check
yarn build
```

---

## 🧪 Testing

### Integration Testing Example

```typescript
import { BitcoinRegtestManager } from '@bitcoin-regtest/server';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

describe('Bitcoin Integration Tests', () => {
  let manager: BitcoinRegtestManager;

  beforeAll(async () => {
    manager = new BitcoinRegtestManager({
      autoMineIntervalMs: 5000  // Faster mining for tests
    });
    await manager.start();
  });

  afterAll(async () => {
    await manager.shutdown();
  });

  it('should fund address and confirm transaction', async () => {
    const address = 'bcrt1q...';

    // Fund address (automatically mines 1 block)
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

  it('should handle unconfirmed transactions', async () => {
    const client = manager.getClient();

    // Send without mining
    const address = 'bcrt1q...';
    const txid = await client.sendToAddress(address, 1.0);

    // Check mempool
    const mempool = await client.getRawMemPool();
    expect(mempool).toContain(txid);

    // Mine to confirm
    await manager.mineBlocks(1);

    const mempoolAfter = await client.getRawMemPool();
    expect(mempoolAfter).not.toContain(txid);
  });
});
```

### Manual Testing

```bash
# Start the environment
yarn start

# In another terminal, use bitcoin-cli
bitcoin-cli -regtest -rpcuser=test -rpcpassword=test123 getblockchaininfo
bitcoin-cli -regtest -rpcuser=test -rpcpassword=test123 getbalance
bitcoin-cli -regtest -rpcuser=test -rpcpassword=test123 getnewaddress

# Or access the web UI
open http://localhost:5173
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Error**: `bind: address already in use`

```bash
# Find and kill bitcoind
pkill bitcoind

# Or stop via CLI
bitcoin-cli -regtest stop

# For Docker
yarn docker:down
```

### Reset Blockchain Data

**Local Development:**
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

### Web UI Not Loading

1. Check if server is running: `curl http://localhost:5173`
2. Check Docker logs: `yarn docker:logs`
3. Rebuild: `yarn docker:build && yarn docker:up`

### RPC Connection Failed

1. Verify bitcoind is running: `bitcoin-cli -regtest getblockchaininfo`
2. Check credentials match (default: `test`/`test123`)
3. Check port 18443 is not blocked

### Build Errors

```bash
# Clean everything and rebuild
yarn clean
rm -rf node_modules packages/*/node_modules
yarn install
yarn build
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/bitcoin-regtest.git
   cd bitcoin-regtest
   ```
3. **Create a branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```

### Making Changes

1. **Install dependencies**: `yarn install`
2. **Make your changes**
3. **Follow the code style**:
   ```bash
   yarn format
   yarn lint:fix
   ```
4. **Test your changes**:
   ```bash
   yarn type-check
   yarn build
   yarn start  # Test manually
   ```

### Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add block explorer navigation
fix: correct mempool transaction display
docs: update API documentation
style: format code with prettier
refactor: simplify transaction parsing
test: add integration tests
chore: update dependencies
```

### Submitting Changes

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your amazing feature"
   ```
2. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
3. **Open a Pull Request** on GitHub
4. **Describe your changes** in the PR description

### What to Contribute

We'd love help with:

- 🐛 **Bug fixes**
- ✨ **New features** (check issues for ideas)
- 📚 **Documentation improvements**
- 🎨 **UI/UX enhancements**
- 🧪 **Tests** (we can always use more!)
- 🔧 **Developer tools**
- 📱 **Mobile responsiveness**

### Development Setup

For the best development experience:

1. **Use VSCode** with recommended extensions:
   - ESLint
   - Prettier
   - TypeScript

2. **Enable format on save** (`.vscode/settings.json`):
   ```json
   {
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     }
   }
   ```

3. **Run checks before committing**:
   ```bash
   yarn format && yarn lint && yarn type-check && yarn build
   ```

### Code Review Process

1. Maintainers will review your PR
2. Address any feedback
3. Once approved, we'll merge your PR
4. Your changes will be in the next release!

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **GitHub**: [Pessina/bitcoin-regtest](https://github.com/Pessina/bitcoin-regtest)
- **Issues**: [Report bugs](https://github.com/Pessina/bitcoin-regtest/issues)
- **Bitcoin Core**: [bitcoin.org](https://bitcoin.org/en/bitcoin-core/)
- **Bitcoin Core RPC**: [API Documentation](https://github.com/ruimarinho/bitcoin-core)

---

## 🙏 Acknowledgments

Built with:
- [Bitcoin Core](https://bitcoin.org/en/bitcoin-core/) - The Bitcoin reference implementation
- [bitcoin-core (npm)](https://github.com/ruimarinho/bitcoin-core) - Bitcoin Core RPC client
- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Vite](https://vitejs.dev/) - Build tool

---

<div align="center">

**Made with ❤️ for Bitcoin developers**

If this project helped you, please ⭐ star it on GitHub!

</div>
