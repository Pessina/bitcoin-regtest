export interface BitcoinRegtestConfig {
  rpcHost: string;
  rpcPort: number;
  rpcUser: string;
  rpcPassword: string;
  network: 'regtest';
  autoMineInitialBlocks: number;
  autoMineIntervalMs: number;
}

export type PartialBitcoinRegtestConfig = Partial<BitcoinRegtestConfig>;

export const defaultConfig: BitcoinRegtestConfig = {
  rpcHost: 'localhost',
  rpcPort: 18443,
  rpcUser: 'test',
  rpcPassword: 'test123',
  network: 'regtest',
  autoMineInitialBlocks: 101,
  autoMineIntervalMs: 10000,
};

export function mergeConfig(
  userConfig?: PartialBitcoinRegtestConfig
): BitcoinRegtestConfig {
  return {
    ...defaultConfig,
    ...userConfig,
  };
}
