#!/usr/bin/env node

/**
 * Pre-flight check: Verify required ports are available before starting Docker
 * This prevents hard-to-debug issues where Docker appears to run but connects to wrong services
 */

import { execSync } from 'child_process';

const REQUIRED_PORTS = [
  { port: 18443, service: 'Bitcoin RPC' },
  { port: 5173, service: 'Web UI' },
];

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function checkPort(port) {
  try {
    // Check for processes LISTENING on the port (not just connected)
    const result = execSync(
      `lsof -i :${port} -sTCP:LISTEN -t 2>/dev/null`,
      {
        encoding: 'utf8',
      }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch {
    // lsof failed or no process found
    return [];
  }
}

function getProcessInfo(pid) {
  try {
    const info = execSync(`ps -p ${pid} -o comm=,args=`, {
      encoding: 'utf8',
    });
    return info.trim();
  } catch {
    return `PID ${pid}`;
  }
}

function main() {
  console.log(`${BOLD}🔍 Checking port availability...${RESET}\n`);

  let hasConflicts = false;
  const conflicts = [];

  for (const { port, service } of REQUIRED_PORTS) {
    const pids = checkPort(port);

    if (pids.length > 0) {
      hasConflicts = true;
      const processInfo = pids.map((pid) => getProcessInfo(pid));

      conflicts.push({
        port,
        service,
        pids,
        processInfo,
      });

      console.log(`${RED}✗ Port ${port} (${service}) is IN USE${RESET}`);
      for (let i = 0; i < pids.length; i++) {
        console.log(`  ${YELLOW}Process: ${processInfo[i]}${RESET}`);
        console.log(`  ${YELLOW}PID: ${pids[i]}${RESET}`);
      }
      console.log('');
    } else {
      console.log(`${GREEN}✓ Port ${port} (${service}) is available${RESET}`);
    }
  }

  if (hasConflicts) {
    console.log(`\n${BOLD}${RED}❌ PORT CONFLICT DETECTED${RESET}\n`);
    console.log(
      `${YELLOW}Docker cannot start because required ports are already in use.${RESET}\n`
    );
    console.log(`${BOLD}To fix this:${RESET}\n`);

    // Check if any conflict is bitcoind
    const hasBitcoind = conflicts.some((c) =>
      c.processInfo.some((info) => info.includes('bitcoind'))
    );

    if (hasBitcoind) {
      console.log(`${YELLOW}1. Stop local bitcoind:${RESET}`);
      console.log(`   pkill bitcoind`);
      console.log('');
      console.log(
        `${YELLOW}2. Or stop it gracefully (if you want to keep its data):${RESET}`
      );
      console.log(`   bitcoin-cli -regtest stop`);
      console.log('');
    }

    console.log(`${YELLOW}Alternative - Kill specific processes:${RESET}`);
    for (const conflict of conflicts) {
      for (const pid of conflict.pids) {
        console.log(`   kill ${pid}  # ${conflict.service}`);
      }
    }
    console.log('');

    console.log(
      `${YELLOW}After stopping conflicting processes, try again:${RESET}`
    );
    console.log(`   yarn docker:dev`);
    console.log('');

    process.exit(1);
  }

  console.log(`\n${GREEN}${BOLD}✓ All ports available!${RESET}\n`);
  process.exit(0);
}

main();
