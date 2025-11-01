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

export function loadConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env
): PartialBitcoinRegtestConfig {
  const config: PartialBitcoinRegtestConfig = {};

  if (env.BITCOIN_RPC_HOST) {
    config.rpcHost = env.BITCOIN_RPC_HOST;
  }

  if (env.BITCOIN_RPC_PORT) {
    const port = Number(env.BITCOIN_RPC_PORT);
    if (!Number.isNaN(port)) {
      config.rpcPort = port;
    }
  }

  if (env.BITCOIN_RPC_USER) {
    config.rpcUser = env.BITCOIN_RPC_USER;
  }

  if (env.BITCOIN_RPC_PASSWORD) {
    config.rpcPassword = env.BITCOIN_RPC_PASSWORD;
  }

  if (env.AUTO_MINE_INITIAL_BLOCKS) {
    const blocks = Number(env.AUTO_MINE_INITIAL_BLOCKS);
    if (!Number.isNaN(blocks)) {
      config.autoMineInitialBlocks = blocks;
    }
  }

  if (env.AUTO_MINE_INTERVAL_MS) {
    const interval = Number(env.AUTO_MINE_INTERVAL_MS);
    if (!Number.isNaN(interval)) {
      config.autoMineIntervalMs = interval;
    }
  }

  return config;
}
