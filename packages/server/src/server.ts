/**
 * Server module for managing Bitcoin regtest environment and web UI
 * Development: Spawns Vite dev server
 * Production: Serves static files from built web UI
 *
 * ============================================================================
 * ARCHITECTURE: Docker vs Server Package - What Each Provides
 * ============================================================================
 *
 * WHY THE SERVER PACKAGE IS NECESSARY (NOT REDUNDANT)
 * ====================================================
 *
 * While Docker handles the runtime environment and Bitcoin Core installation,
 * the server package provides the ORCHESTRATION LAYER that makes everything work.
 *
 * WHAT DOCKER PROVIDES:
 * ---------------------
 * 1. Container environment (isolation, networking)
 * 2. Bitcoin Core v30 binary installation
 * 3. Port exposure (18443 for RPC, 5173 for web UI)
 * 4. Runtime dependencies (Node.js, etc.)
 *
 * WHAT THE SERVER PACKAGE PROVIDES (CRITICAL FUNCTIONALITY):
 * ----------------------------------------------------------
 * 1. **bitcoind Lifecycle Management** (BitcoinRegtestManager)
 *    - Spawns and controls the bitcoind daemon
 *    - Manages graceful startup and shutdown
 *    - Ensures bitcoind is ready before accepting connections
 *
 * 2. **Auto-Mining Logic** (BitcoinRegtestManager)
 *    - Automatically mines blocks every 10 seconds (configurable)
 *    - This is custom logic, NOT part of Bitcoin Core
 *    - Essential for regtest to be useful without manual intervention
 *    - Mines initial 101 blocks to make funds spendable
 *
 * 3. **Wallet Management** (BitcoinRegtestManager)
 *    - Creates and loads wallets automatically
 *    - Provides wallet addresses for testing
 *    - Manages wallet balance and funding
 *
 * 4. **RPC Proxy** (this file - server.ts)
 *    - CRITICAL: Browsers cannot directly connect to bitcoind due to CORS
 *    - Proxies /rpc requests from web UI to bitcoind (port 18443)
 *    - Handles Basic Authentication credentials
 *    - Without this proxy, the web UI is completely non-functional
 *
 * 5. **Web UI Server** (this file - server.ts)
 *    - Production: Serves static files from packages/web/dist
 *    - Development: Spawns and manages Vite dev server
 *    - Both modes require the proxy for RPC communication
 *
 * 6. **Programmatic API** (BitcoinRegtestManager)
 *    - Clean TypeScript API for integration testing
 *    - Methods like mineBlocks(), fundAddress(), getClient()
 *    - Reusable library for testing Bitcoin applications
 *
 * SYSTEM FLOW:
 * ------------
 * 1. Docker container starts
 * 2. Node.js executes packages/server/dist/cli.js
 * 3. BitcoinRegtestManager starts bitcoind daemon
 * 4. Wallet is created/loaded automatically
 * 5. Initial blocks are mined (if needed)
 * 6. Auto-mining timer starts (mines 1 block every 10s)
 * 7. HTTP server starts:
 *    - Production: Serves static files + proxies /rpc
 *    - Development: Spawns Vite + relies on Vite's proxy
 * 8. Web UI loads and communicates via /rpc proxy
 *
 * WHY YOU CAN'T JUST DELETE THE SERVER PACKAGE:
 * ----------------------------------------------
 * Without the server package:
 * ✗ No auto-mining (regtest would require manual block mining)
 * ✗ No RPC proxy (web UI cannot communicate with bitcoind)
 * ✗ No orchestration (manual bitcoind startup/shutdown)
 * ✗ No wallet automation (manual wallet creation)
 * ✗ No programmatic API for testing
 * ✗ No web UI server in production mode
 *
 * The server package is the "brain" that orchestrates everything.
 * Docker is just the "container" that provides the environment.
 * ============================================================================
 */

import { spawn, ChildProcess } from 'child_process';
import {
  createServer,
  IncomingMessage,
  ServerResponse,
  request as httpRequest,
} from 'http';
import { createReadStream, existsSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';

import { BitcoinRegtestManager } from './BitcoinRegtestManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let manager: BitcoinRegtestManager | null = null;
let webProcess: ChildProcess | null = null;
let staticServer: ReturnType<typeof createServer> | null = null;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

function printBanner() {
  const banner = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║         🪙  Bitcoin Regtest Environment - Ready! 🪙          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;
  console.log(banner);
}

function printServiceInfo() {
  const isDocker = process.env.DOCKER_CONTAINER === 'true';
  const hostname = isDocker ? process.env.HOSTNAME || 'localhost' : 'localhost';

  console.log('\n📡 Services Available:\n');
  console.log(`   🌐 Web UI:        http://${hostname}:5173`);
  console.log(`   ⚡ Bitcoin RPC:   http://${hostname}:18443`);

  console.log('\n🔑 RPC Credentials:\n');
  console.log('   Username:  test');
  console.log('   Password:  test123');

  if (manager) {
    const address = manager.getWalletAddress();
    console.log('\n💰 Wallet Info:\n');
    console.log(`   Address:   ${address}`);
    console.log('   Network:   regtest');
    console.log('   Auto-mine: Every 10 seconds');
  }

  console.log('\n📚 Useful Commands:\n');
  console.log('   # View logs');
  if (isDocker) {
    console.log('   docker logs -f bitcoin-regtest\n');
    console.log('   # Access RPC from host');
    console.log(
      `   bitcoin-cli -regtest -rpcuser=test -rpcpassword=test123 -rpcconnect=${hostname} getblockchaininfo\n`
    );
    console.log('   # Stop container');
    console.log('   docker-compose down\n');
  } else {
    console.log('   bitcoin-cli -regtest getblockchaininfo');
    console.log('   bitcoin-cli -regtest getbalance');
    console.log('   bitcoin-cli -regtest getnewaddress\n');
  }

  console.log('📖 Documentation: https://github.com/Pessina/bitcoin-regtest\n');
  console.log(
    '═══════════════════════════════════════════════════════════════\n'
  );
}

async function initBitcoinRegtest() {
  console.log('🚀 Initializing Bitcoin Regtest environment...\n');
  manager = new BitcoinRegtestManager();
  await manager.start();
  console.log('\n✅ Bitcoin regtest initialized!');
}

function proxyRpcRequest(req: IncomingMessage, res: ServerResponse) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const auth = Buffer.from('test:test123').toString('base64');

    const proxyReq = httpRequest(
      {
        hostname: 'localhost',
        port: 18443,
        path: '/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          Authorization: `Basic ${auth}`,
        },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', (error) => {
      console.error('RPC proxy error:', error);
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Bad Gateway: Unable to connect to Bitcoin RPC');
    });

    proxyReq.write(body);
    proxyReq.end();
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
  });
}

function serveStaticFile(
  _req: IncomingMessage,
  res: ServerResponse,
  filePath: string
) {
  const ext = extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const stat = statSync(filePath);
  if (stat.isDirectory()) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(res);
}

function startStaticServer() {
  const webDistPath = join(__dirname, '..', '..', 'web', 'dist');
  const port = 5173;

  console.log('🌐 Starting static web server...\n');

  if (!existsSync(webDistPath)) {
    console.error(
      `❌ Web UI build not found at ${webDistPath}. Run 'yarn build' first.`
    );
    return;
  }

  staticServer = createServer((req, res) => {
    // Proxy RPC requests to bitcoind
    if (req.url === '/rpc' && req.method === 'POST') {
      proxyRpcRequest(req, res);
      return;
    }

    // Serve static files
    let filePath = join(webDistPath, req.url === '/' ? 'index.html' : req.url!);

    // SPA fallback - serve index.html for routes that don't match files
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      filePath = join(webDistPath, 'index.html');
    }

    serveStaticFile(req, res, filePath);
  });

  staticServer.listen(port, () => {
    console.log(`✅ Web UI ready at http://localhost:${port}\n`);
  });

  staticServer.on('error', (error) => {
    console.error('❌ Static server error:', error);
  });
}

function startViteDevServer() {
  const webDir = join(__dirname, '..', '..', 'web');
  console.log('🌐 Starting Vite dev server...\n');

  webProcess = spawn('yarn', ['dev'], {
    cwd: webDir,
    stdio: 'pipe',
    shell: true,
  });

  webProcess.stdout?.on('data', (data) => {
    const output = data.toString();
    // Only log important Vite messages, suppress verbose output
    if (output.includes('Local:') || output.includes('ready in')) {
      console.log(output.trim());
    }
  });

  webProcess.stderr?.on('data', (data) => {
    console.error(data.toString());
  });

  webProcess.on('error', (error) => {
    console.error('❌ Vite dev server error:', error);
  });
}

function startWebUI() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    startStaticServer();
  } else {
    startViteDevServer();
  }
}

export async function startServer() {
  await initBitcoinRegtest();

  setTimeout(() => {
    startWebUI();

    // Give web UI time to start before showing banner
    setTimeout(() => {
      printBanner();
      printServiceInfo();
    }, 3000);
  }, 1000);
}

export async function stopServer() {
  console.log('\n🛑 Shutting down...\n');

  if (staticServer) {
    console.log('   Stopping static server...');
    staticServer.close();
    staticServer = null;
  }

  if (webProcess) {
    console.log('   Stopping Vite dev server...');
    webProcess.kill('SIGTERM');
    webProcess = null;
  }

  if (manager) {
    await manager.shutdown();
  }

  console.log('✅ Shutdown complete\n');
}
