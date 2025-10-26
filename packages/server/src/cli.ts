#!/usr/bin/env node

import { startServer, stopServer } from './server.js';

async function main() {
  try {
    await startServer();

    const shutdown = () => {
      void (async () => {
        console.log('\nShutting down...');
        await stopServer();
        process.exit(0);
      })();
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    await new Promise(() => {});
  } catch (error) {
    console.error('Failed to start Bitcoin regtest:', error);
    process.exit(1);
  }
}

void main();
