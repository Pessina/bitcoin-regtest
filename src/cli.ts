#!/usr/bin/env node

import { start } from './index.js';

async function main() {
  try {
    const manager = await start();

    // Handle shutdown gracefully
    const shutdown = async () => {
      console.log('\n🛑 Shutting down...');
      await manager.shutdown();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Keep process alive
    await new Promise(() => {});
  } catch (error) {
    console.error('❌ Failed to start Bitcoin regtest:', error);
    process.exit(1);
  }
}

main();
