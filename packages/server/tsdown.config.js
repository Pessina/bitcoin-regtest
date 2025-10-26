"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tsdown_1 = require("tsdown");
exports.default = (0, tsdown_1.defineConfig)([
    {
        entry: ['./src/index.ts', './src/cli.ts'],
        format: ['esm'],
        dts: {
            entry: './src/index.ts',
        },
        sourcemap: true,
        clean: true,
        shims: true,
    },
]);
