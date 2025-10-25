# Publishing Guide for bitcoin-regtest

This guide explains how to publish the `bitcoin-regtest` package to npm.

## Prerequisites

1. **npm Account** - You need an npm account with publish permissions
2. **Authentication** - Run `npm login` to authenticate

```bash
npm login
```

3. **Build Success** - Ensure the package builds without errors

```bash
yarn workspace bitcoin-regtest build
```

## Version Management

The package uses semantic versioning (semver): `MAJOR.MINOR.PATCH-PRERELEASE`

### Beta Releases (Recommended for Testing)

For testing new features before official release:

```bash
# From repository root
yarn workspace bitcoin-regtest publish:beta
```

This will:

1. Bump version to next prerelease (e.g., `1.0.0` → `1.0.1-beta.0`)
2. Build the package
3. Publish to npm with `@beta` tag

Users install with:

```bash
npm install bitcoin-regtest@beta
```

### Official Releases

For production-ready versions:

#### Patch Release (Bug fixes)

```bash
# From repository root
cd clients/bitcoin-regtest
yarn version:patch
yarn publish:official
```

Example: `1.0.0` → `1.0.1`

#### Minor Release (New features, backward compatible)

```bash
# From repository root
cd clients/bitcoin-regtest
yarn version:minor
yarn publish:official
```

Example: `1.0.0` → `1.1.0`

#### Major Release (Breaking changes)

```bash
# From repository root
cd clients/bitcoin-regtest
yarn version:major
yarn publish:official
```

Example: `1.0.0` → `2.0.0`

## Pre-Publish Checklist

Before publishing, ensure:

- [ ] Build succeeds without errors: `yarn workspace bitcoin-regtest build`
- [ ] Code is formatted: `yarn format`
- [ ] Linting passes: `yarn lint`
- [ ] README.md is up to date
- [ ] All exports are correct (check `dist/index.d.ts`)
- [ ] CLI works: Test `node dist/cli.js`
- [ ] Package version is correct in `package.json`

## What Gets Published

The following files/directories are included in the npm package (see `package.json` `files` field):

```json
{
  "files": [
    "dist", // Compiled code (ES modules + types)
    "README.md" // Documentation
  ]
}
```

Everything else (source code, tests, config files) is **excluded** from the published package.

## Verifying the Package

Before publishing, you can test the package locally:

### 1. Pack the package

```bash
cd clients/bitcoin-regtest
yarn pack
```

This creates a `.tgz` file (e.g., `bitcoin-regtest-v1.0.0.tgz`)

### 2. Install in a test project

```bash
cd /path/to/test-project
npm install /path/to/bitcoin-regtest-v1.0.0.tgz
```

### 3. Test imports and CLI

```typescript
// Test programmatic API
import { start } from 'bitcoin-regtest';

const regtest = await start();
const address = await regtest.getWalletAddress();
console.log('Regtest address:', address);
await regtest.shutdown();
```

```bash
# Test CLI
npx bitcoin-regtest
# Should start regtest server
```

## Troubleshooting

### "You do not have permission to publish"

Ensure you're logged in with the correct npm account:

```bash
npm whoami
npm login
```

### "Version already exists"

You're trying to publish a version that already exists on npm. Bump the version:

```bash
yarn version:patch  # or minor/major
```

### Build errors

Check TypeScript compilation:

```bash
yarn workspace bitcoin-regtest build
```

Fix any TypeScript errors before publishing.

### Missing CLI executable

If `npx bitcoin-regtest` doesn't work after installing:

1. Check `package.json` has `bin` field:

   ```json
   {
     "bin": {
       "bitcoin-regtest": "./dist/cli.js"
     }
   }
   ```

2. Check `dist/cli.js` has shebang:

   ```javascript
   #!/usr/bin/env node
   ```

3. Rebuild package:
   ```bash
   yarn clean && yarn build
   ```

### Missing exports

Check `index.ts` exports and verify in built types:

```bash
cat clients/bitcoin-regtest/dist/index.d.ts
```

Should export:

- `BitcoinRegtestManager`
- `config`, `BitcoinRegtestConfig`
- `start()`

## Post-Publish

After publishing:

1. **Tag the release** in Git (optional but recommended)

```bash
git tag bitcoin-regtest-v1.0.0
git push origin bitcoin-regtest-v1.0.0
```

2. **Verify on npm** - Check https://www.npmjs.com/package/bitcoin-regtest

3. **Test installation** in a fresh project

```bash
npm install bitcoin-regtest
npx bitcoin-regtest
```

4. **Test programmatic usage**

```bash
mkdir test-bitcoin-regtest
cd test-bitcoin-regtest
npm init -y
npm install bitcoin-regtest
```

Create `test.js`:

```javascript
import { start } from 'bitcoin-regtest';

const regtest = await start();
console.log('Regtest started!');

const address = await regtest.getWalletAddress();
console.log('Address:', address);

const balance = await regtest.getBalance();
console.log('Balance:', balance, 'BTC');

await regtest.shutdown();
```

Run:

```bash
node test.js
```

## Automatic Publishing (prepublishOnly)

The `prepublishOnly` script in `package.json` automatically runs `yarn clean && yarn build` before every publish:

```json
{
  "scripts": {
    "prepublishOnly": "yarn clean && yarn build"
  }
}
```

This ensures you never publish without a fresh build.

## Package Metadata

Current package configuration:

- **Name**: `bitcoin-regtest`
- **License**: MIT
- **Package Manager**: Yarn
- **Module Type**: ESM (ES Modules)
- **Exports**: Full TypeScript definitions included
- **CLI**: `npx bitcoin-regtest` (runs standalone server)
- **API**: Programmatic `start()` function

## Publishing from CI/CD

If setting up automated publishing:

1. Store npm token as secret: `NPM_TOKEN`
2. Authenticate in CI:

```yaml
- name: Setup npm auth
  run: echo "//registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}" > ~/.npmrc

- name: Publish
  run: yarn workspace bitcoin-regtest publish:official
```

## Rolling Back a Release

If you need to unpublish a version (only possible within 72 hours):

```bash
npm unpublish bitcoin-regtest@1.0.0
```

**Warning**: Unpublishing is discouraged by npm. Consider publishing a patch version instead.

## Related Packages

When publishing `bitcoin-regtest`, you may also want to publish:

- `fakenet-signer` - Multi-chain MPC signature orchestrator that uses bitcoin-regtest for testing

Both packages are independent and can be published separately.

## Questions?

- Check npm docs: https://docs.npmjs.com/cli/v10/commands/npm-publish
- Check package.json scripts for available commands
- File issues: https://github.com/sig-net/signet-solana-program/issues
