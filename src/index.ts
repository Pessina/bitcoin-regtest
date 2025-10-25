export { BitcoinRegtestManager } from './BitcoinRegtestManager';
export { config, type BitcoinRegtestConfig } from './config';

import { BitcoinRegtestManager } from './BitcoinRegtestManager';
import { config } from './config';

export async function start(): Promise<BitcoinRegtestManager> {
  const manager = new BitcoinRegtestManager(config);
  await manager.initialize();
  return manager;
}
