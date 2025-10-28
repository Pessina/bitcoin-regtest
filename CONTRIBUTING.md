# Contributing Guide

Thank you for considering contributing to Bitcoin Regtest Explorer.

## Getting Started

### Prerequisites

- Node.js >= 22.0
- Yarn >= 1.22
- Bitcoin Core >= 30.0 (for local development)
- Git

### Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/bitcoin-regtest.git
cd bitcoin-regtest
```

2. Add upstream remote:
```bash
git remote add upstream https://github.com/Pessina/bitcoin-regtest.git
```

3. Install dependencies:
```bash
yarn install
```

4. Build and verify:
```bash
yarn build
yarn type-check
yarn start
```

## Development Workflow

### Creating a Branch

Use descriptive branch names with prefixes:

```bash
git checkout -b feature/add-lightning-support
git checkout -b fix/mempool-display-bug
git checkout -b docs/api-examples
```

Branch prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Tests
- `chore/` - Maintenance

### Making Changes

1. Make your changes following the [code style](#code-style)
2. Add tests for new features
3. Update documentation as needed
4. Keep commits focused and atomic

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add lightning network support
fix: correct mempool transaction sorting
docs: add API usage examples
style: format code with prettier
refactor: simplify RPC client initialization
test: add tests for address validation
chore: update dependencies
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting (no code change)
- `refactor` - Code change (neither feature nor fix)
- `test` - Adding tests
- `chore` - Maintenance tasks

### Before Committing

Run the following checks:

```bash
yarn format
yarn lint:fix
yarn type-check
yarn build
```

### Syncing with Upstream

Keep your fork up to date:

```bash
git fetch upstream
git rebase upstream/main
```

### Submitting a Pull Request

1. Push your branch:
```bash
git push origin feature/your-feature
```

2. Open a Pull Request with:
   - Clear, descriptive title (following conventional commits)
   - Detailed description of changes
   - Reference to related issues (if applicable)
   - Screenshots for UI changes

3. Address review feedback promptly

## Code Style

### TypeScript

- Use strict mode
- Define explicit types for parameters and returns
- Avoid `any`; use `unknown` if type is truly unknown
- Use interfaces for object shapes

Example:
```typescript
interface BlockData {
  height: number;
  hash: string;
  transactions: Transaction[];
}

async function getBlock(hash: string): Promise<BlockData> {
  const data = await rpc('getblock', [hash, 2]);
  return parseBlock(data);
}
```

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use meaningful names

Example:
```typescript
export function BlockList() {
  const { data, isLoading } = useQuery({
    queryKey: ['blocks'],
    queryFn: getBlocks,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {data?.map(block => (
        <BlockCard key={block.hash} block={block} />
      ))}
    </div>
  );
}
```

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors

Example:
```typescript
<div className="flex items-center gap-2 p-4 rounded-lg border border-gray-200">
  <Icon className="h-4 w-4 text-blue-600" />
  <span className="text-sm font-medium text-gray-900">Block Height</span>
</div>
```

### File Organization

- One component per file
- Co-locate related files
- Keep files under 300 lines
- Use barrel exports (index.ts) for clean imports

### API Methods

- Use async/await
- Handle errors appropriately
- Add JSDoc comments for public APIs
- Return strongly typed data

Example:
```typescript
/**
 * Fetches block details by hash or height.
 * @param identifier - Block hash or height
 * @returns Block details with transactions
 * @throws Error if block not found
 */
export async function getBlock(
  identifier: string | number
): Promise<BlockDetail> {
  try {
    const block = await rpc('getblock', [identifier, 2]);
    return parseBlockData(block);
  } catch (error) {
    throw new Error(`Failed to fetch block: ${error.message}`);
  }
}
```

## Project Structure

### Repository Layout

```
bitcoin-regtest/
├── packages/
│   ├── server/          # Bitcoin regtest manager
│   └── web/            # React explorer UI
├── docker-compose.yml
├── Dockerfile
└── package.json
```

### Where to Make Changes

| Change | Location |
|--------|----------|
| Bitcoin regtest logic | `packages/server/src/BitcoinRegtestManager.ts` |
| HTTP server | `packages/server/src/server.ts` |
| API client | `packages/web/src/lib/api.ts` |
| UI components | `packages/web/src/components/` |
| Utilities | `packages/web/src/lib/` |
| Documentation | `README.md`, `CONTRIBUTING.md` |

## Testing

### Running Tests

```bash
yarn test
yarn workspace @bitcoin-regtest/server test
yarn workspace @bitcoin-regtest/web test
```

### Writing Tests

**Unit Tests:**
```typescript
import { formatTimeAgo } from '../lib/timeUtils';

describe('formatTimeAgo', () => {
  it('should format seconds', () => {
    const result = formatTimeAgo(Date.now() / 1000 - 30);
    expect(result).toBe('30s ago');
  });
});
```

**Integration Tests:**
```typescript
import { BitcoinRegtestManager } from '@bitcoin-regtest/server';

describe('BitcoinRegtestManager', () => {
  let manager: BitcoinRegtestManager;

  beforeAll(async () => {
    manager = new BitcoinRegtestManager();
    await manager.start();
  });

  afterAll(async () => {
    await manager.shutdown();
  });

  it('should fund address', async () => {
    const address = manager.getWalletAddress();
    const txid = await manager.fundAddress(address, 1.0);
    expect(txid).toBeDefined();
  });
});
```

### Manual Testing

Always test changes manually:

1. Start: `yarn start`
2. Open: http://localhost:5173
3. Test affected features
4. Check console for errors
5. Test responsive behavior

## Documentation

### Code Comments

Add JSDoc comments for public APIs:

```typescript
/**
 * Mines blocks automatically at regular intervals.
 * Uses generatetoaddress RPC to ensure deterministic mining.
 */
private startAutoMining(): void {
  // Implementation
}
```

### README Updates

Update README when:
- Adding new features
- Changing APIs
- Modifying setup process
- Adding dependencies

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Type checking passes
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] Commit messages follow convention

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How the changes were tested

## Related Issues
Closes #123
```

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open an Issue
- **Features**: Open an Issue
- **Security**: See SECURITY.md (if exists)

## Code of Conduct

Be respectful and professional in all interactions. We're building tools for the Bitcoin developer community.
