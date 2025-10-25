#!/usr/bin/env node

import { BitcoinRegtestManager } from './index.js';

async function main() {
  try {
    const manager = new BitcoinRegtestManager();
    await manager.start();

    // Handle shutdown gracefully
    const shutdown = () => {
      void (async () => {
        console.log('\nShutting down...');
        await manager.shutdown();
        process.exit(0);
      })();
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Keep process alive
    await new Promise(() => {});
  } catch (error) {
    console.error('Failed to start Bitcoin regtest:', error);
    process.exit(1);
  }
}

void main();
