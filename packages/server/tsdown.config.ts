import { defineConfig } from 'tsdown';

// @ts-expect-error - tsdown types have resolution issues with TypeScript bundler module resolution
export default defineConfig({
  entry: ['./src/index.ts', './src/cli.ts'],
  format: ['esm'],
  dts: {
    entry: './src/index.ts',
  },
  sourcemap: true,
  clean: true,
  shims: true,
});
