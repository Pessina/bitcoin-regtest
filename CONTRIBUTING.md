# Contributing to Bitcoin Regtest Explorer

First off, thank you for considering contributing to Bitcoin Regtest Explorer! It's people like you that make this tool better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and professional in all interactions.

### Our Standards

- ✅ Use welcoming and inclusive language
- ✅ Be respectful of differing viewpoints
- ✅ Accept constructive criticism gracefully
- ✅ Focus on what is best for the community

---

## Getting Started

### Prerequisites

- Node.js >= 22.0
- Yarn >= 1.22
- Bitcoin Core >= 30.0 (for local development)
- Git
- A code editor (we recommend VS Code)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/bitcoin-regtest.git
   cd bitcoin-regtest
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/Pessina/bitcoin-regtest.git
   ```

---

## Development Setup

### Initial Setup

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Start development
yarn start
```

### VS Code Setup (Recommended)

1. **Install Extensions**:
   - ESLint
   - Prettier - Code formatter
   - TypeScript Vue Plugin (Volar)

2. **Workspace Settings** (`.vscode/settings.json`):
   ```json
   {
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "typescript.tsdk": "node_modules/typescript/lib",
     "typescript.enablePromptUseWorkspaceTsdk": true
   }
   ```

---

## How to Contribute

### Types of Contributions

We welcome many types of contributions:

#### 🐛 Bug Reports

Found a bug? Please open an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, etc.)

#### ✨ Feature Requests

Have an idea? Open an issue with:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Examples or mockups if applicable

#### 📝 Documentation

Help improve our docs:
- Fix typos or clarify existing docs
- Add examples or tutorials
- Improve API documentation
- Translate documentation

#### 🎨 UI/UX Improvements

Enhance the web explorer:
- Design improvements
- Accessibility enhancements
- Mobile responsiveness
- User experience refinements

#### 🧪 Tests

Help us maintain quality:
- Add unit tests
- Write integration tests
- Improve test coverage
- Fix flaky tests

---

## Pull Request Process

### 1. Create a Branch

Use descriptive branch names:
```bash
git checkout -b feature/add-lightning-support
git checkout -b fix/mempool-display-bug
git checkout -b docs/api-examples
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow our [coding standards](#coding-standards)
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and focused

### 3. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>: <description>

feat: add lightning network support
fix: correct mempool transaction sorting
docs: add API usage examples
style: format code with prettier
refactor: simplify RPC client initialization
test: add tests for address validation
chore: update dependencies
```

**Commit Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting (no code change)
- `refactor` - Code change (no feature/fix)
- `test` - Adding tests
- `chore` - Maintenance

### 4. Sync with Upstream

Keep your branch up to date:
```bash
git fetch upstream
git rebase upstream/main
```

### 5. Run Checks

Before pushing, ensure everything passes:
```bash
# Format code
yarn format

# Fix linting issues
yarn lint:fix

# Type check
yarn type-check

# Build
yarn build

# Test manually
yarn start
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title following conventional commits
- Detailed description of changes
- Reference any related issues
- Screenshots for UI changes
- Test results

### 7. Code Review

- Address reviewer feedback promptly
- Keep discussions professional
- Be open to suggestions
- Update your PR as needed

---

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define types for all function parameters and returns
- Avoid `any` - use `unknown` if needed
- Use interfaces over type aliases for objects

**Example:**
```typescript
// ✅ Good
interface BlockData {
  height: number;
  hash: string;
  transactions: Transaction[];
}

async function getBlock(hash: string): Promise<BlockData> {
  // ...
}

// ❌ Bad
function getBlock(hash: any): any {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use meaningful component names
- Extract reusable logic into custom hooks

**Example:**
```typescript
// ✅ Good
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
- Use semantic color names
- Maintain consistent spacing

**Example:**
```typescript
// ✅ Good
<div className="flex items-center gap-2 p-4 rounded-lg border border-gray-200">
  <Icon className="h-4 w-4 text-blue-600" />
  <span className="text-sm font-medium text-gray-900">Block Height</span>
</div>
```

### File Organization

- One component per file
- Co-locate related files
- Use index files for clean imports
- Keep files under 300 lines

**Directory Structure:**
```
src/
├── components/
│   ├── BlockList/
│   │   ├── BlockList.tsx
│   │   ├── BlockCard.tsx
│   │   └── index.ts
│   └── ui/
│       └── button.tsx
├── lib/
│   ├── api.ts
│   └── utils.ts
└── hooks/
    └── useBlocks.ts
```

### API Methods

- Use async/await (not promises)
- Handle errors gracefully
- Add JSDoc comments
- Return typed data

**Example:**
```typescript
/**
 * Fetches block details by hash or height
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

---

## Project Structure

### Monorepo Layout

```
bitcoin-regtest/
├── packages/
│   ├── server/          # Bitcoin regtest manager
│   │   ├── src/
│   │   │   ├── BitcoinRegtestManager.ts
│   │   │   ├── server.ts
│   │   │   ├── cli.ts
│   │   │   └── types.ts
│   │   └── package.json
│   │
│   └── web/            # React explorer UI
│       ├── src/
│       │   ├── components/
│       │   ├── lib/
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── package.json
│
├── .github/            # GitHub workflows
├── docker-compose.yml
├── Dockerfile
├── package.json        # Root package
└── tsconfig.base.json
```

### Where to Make Changes

| Change Type | Location |
|-------------|----------|
| Bitcoin regtest logic | `packages/server/src/BitcoinRegtestManager.ts` |
| HTTP server/proxy | `packages/server/src/server.ts` |
| API client | `packages/web/src/lib/api.ts` |
| UI components | `packages/web/src/components/` |
| Utilities | `packages/web/src/lib/` |
| Styling | Tailwind classes in components |
| Documentation | `README.md`, `CONTRIBUTING.md` |

---

## Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run specific package tests
yarn workspace @bitcoin-regtest/server test
yarn workspace @bitcoin-regtest/web test

# Watch mode
yarn test --watch
```

### Writing Tests

#### Unit Tests

```typescript
import { formatTimeAgo } from '../lib/timeUtils';

describe('formatTimeAgo', () => {
  it('should format seconds', () => {
    const result = formatTimeAgo(Date.now() / 1000 - 30);
    expect(result).toBe('30s ago');
  });

  it('should format minutes', () => {
    const result = formatTimeAgo(Date.now() / 1000 - 300);
    expect(result).toBe('5m ago');
  });
});
```

#### Integration Tests

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

Always test your changes manually:

1. Start the application: `yarn start`
2. Open http://localhost:5173
3. Test all affected features
4. Check browser console for errors
5. Test on different screen sizes

---

## Documentation

### Code Comments

- Add JSDoc for public APIs
- Explain "why", not "what"
- Keep comments up to date

```typescript
/**
 * Mines blocks automatically at regular intervals.
 * Uses generatetoaddress RPC to ensure deterministic mining.
 */
private startAutoMining(): void {
  // ...
}
```

### README Updates

Update README when:
- Adding new features
- Changing APIs
- Modifying setup steps
- Adding dependencies

### Changelog

Update CHANGELOG.md (if exists):
- Add entry under "Unreleased"
- Follow Keep a Changelog format
- Link to issues/PRs

---

## Questions?

- **General Questions**: Open a GitHub Discussion
- **Bug Reports**: Open an Issue
- **Feature Requests**: Open an Issue
- **Security Issues**: Email (add security email)

---

## Recognition

Contributors will be:
- Listed in README (optional)
- Mentioned in release notes
- Part of an amazing Bitcoin developer community!

---

Thank you for contributing to Bitcoin Regtest Explorer! 🚀
