export interface BitcoinRegtestConfig {
  rpcHost: string;
  rpcPort: number;
  rpcUser: string;
  rpcPassword: string;
  network: 'regtest';
  autoMineInitialBlocks: number;
  autoMineIntervalMs: number;
}

export const config: BitcoinRegtestConfig = {
  rpcHost: 'localhost',
  rpcPort: 18443,
  rpcUser: 'test',
  rpcPassword: 'test123',
  network: 'regtest',
  autoMineInitialBlocks: 101,
  autoMineIntervalMs: 10000,
};
