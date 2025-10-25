import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts', './src/cli.ts'],
  format: ['esm'],
  dts: {
    entry: './src/index.ts', // Only generate types for main entry
  },
  sourcemap: true,
  clean: true,
  shims: true,
});
