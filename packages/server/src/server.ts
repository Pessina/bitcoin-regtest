import express from 'express';
import cors from 'cors';
import { spawn, ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { BitcoinRegtestManager } from './BitcoinRegtestManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let manager: BitcoinRegtestManager | null = null;
let webProcess: ChildProcess | null = null;

async function initBitcoinRegtest() {
  manager = new BitcoinRegtestManager();
  await manager.start();
  console.log('Bitcoin regtest started');
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/blocks/latest', async (req, res) => {
  try {
    if (!manager) {
      return res.status(503).json({ error: 'Bitcoin regtest not initialized' });
    }

    const client = manager.getClient();
    const blockCount = await client.getBlockCount();
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const blocks = [];
    for (let i = 0; i < limit && blockCount - i >= 0; i++) {
      const blockHash = await client.getBlockHash(blockCount - i);
      const block = await client.getBlock(blockHash, 2);
      blocks.push({
        height: block.height,
        hash: block.hash,
        time: block.time,
        size: block.size,
        txCount: block.tx?.length || 0,
        difficulty: block.difficulty,
      });
    }

    res.json(blocks);
  } catch (error) {
    console.error('Error fetching latest blocks:', error);
    res.status(500).json({ error: 'Failed to fetch blocks' });
  }
});

app.get('/api/blocks/:heightOrHash', async (req, res) => {
  try {
    if (!manager) {
      return res.status(503).json({ error: 'Bitcoin regtest not initialized' });
    }

    const client = manager.getClient();
    const { heightOrHash } = req.params;

    let blockHash: string;
    if (/^\d+$/.test(heightOrHash)) {
      blockHash = await client.getBlockHash(Number(heightOrHash));
    } else {
      blockHash = heightOrHash;
    }

    const block = await client.getBlock(blockHash, 2);

    res.json({
      height: block.height,
      hash: block.hash,
      time: block.time,
      size: block.size,
      weight: block.weight,
      version: block.version,
      merkleroot: block.merkleroot,
      nonce: block.nonce,
      bits: block.bits,
      difficulty: block.difficulty,
      previousblockhash: block.previousblockhash,
      nextblockhash: block.nextblockhash,
      transactions: block.tx || [],
    });
  } catch (error) {
    console.error('Error fetching block:', error);
    res.status(404).json({ error: 'Block not found' });
  }
});

app.get('/api/address/:address/balance', async (req, res) => {
  try {
    if (!manager) {
      return res.status(503).json({ error: 'Bitcoin regtest not initialized' });
    }

    const client = manager.getClient();
    const { address } = req.params;

    const utxos = await client.command('scantxoutset', 'start', [`addr(${address})`]);

    const balance = utxos.total_amount || 0;
    const utxoCount = utxos.unspents?.length || 0;

    res.json({
      address,
      balance,
      utxoCount,
      utxos: utxos.unspents || [],
    });
  } catch (error) {
    console.error('Error fetching address balance:', error);
    res.status(500).json({ error: 'Failed to fetch address balance' });
  }
});

app.get('/api/blockchain/info', async (req, res) => {
  try {
    if (!manager) {
      return res.status(503).json({ error: 'Bitcoin regtest not initialized' });
    }

    const client = manager.getClient();
    const info = await client.getBlockchainInfo();

    res.json({
      chain: info.chain,
      blocks: info.blocks,
      bestblockhash: info.bestblockhash,
      difficulty: info.difficulty,
      mediantime: info.mediantime,
      size_on_disk: info.size_on_disk,
    });
  } catch (error) {
    console.error('Error fetching blockchain info:', error);
    res.status(500).json({ error: 'Failed to fetch blockchain info' });
  }
});

function startWebUI() {
  const webDir = join(__dirname, '..', '..', 'web');
  console.log('Starting web UI...');

  webProcess = spawn('yarn', ['dev'], {
    cwd: webDir,
    stdio: 'inherit',
    shell: true,
  });

  webProcess.on('error', (error) => {
    console.error('Web UI error:', error);
  });
}

export async function startServer() {
  await initBitcoinRegtest();
  return new Promise<void>((resolve) => {
    app.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}`);

      setTimeout(() => {
        startWebUI();
      }, 1000);

      resolve();
    });
  });
}

export async function stopServer() {
  if (webProcess) {
    console.log('Stopping web UI...');
    webProcess.kill('SIGTERM');
    webProcess = null;
  }
  if (manager) {
    await manager.shutdown();
  }
}
