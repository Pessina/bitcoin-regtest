# Stage 1: Build
# Use Node.js 22 (latest LTS) on Debian Slim
FROM node:22-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY packages/server/package.json ./packages/server/
COPY packages/web/package.json ./packages/web/

# Install dependencies with frozen lockfile for reproducibility
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy source code
COPY . .

# Build packages
RUN yarn build

# Stage 2: Runtime
# Use Node.js 22 (latest LTS) on Debian Slim
FROM node:22-slim

# Install Bitcoin Core 30.0 (latest stable) from Bitcoin Core official releases
ARG BITCOIN_VERSION=30.0

RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /tmp/bitcoin \
    && cd /tmp/bitcoin \
    # Download Bitcoin Core based on architecture (auto-detect)
    && ARCH=$(uname -m) \
    && if [ "$ARCH" = "x86_64" ]; then \
        BITCOIN_ARCH="x86_64-linux-gnu"; \
       elif [ "$ARCH" = "aarch64" ]; then \
        BITCOIN_ARCH="aarch64-linux-gnu"; \
       else \
        echo "Unsupported architecture: $ARCH" && exit 1; \
       fi \
    && curl -SLO "https://bitcoincore.org/bin/bitcoin-core-${BITCOIN_VERSION}/bitcoin-${BITCOIN_VERSION}-${BITCOIN_ARCH}.tar.gz" \
    && tar -xzf "bitcoin-${BITCOIN_VERSION}-${BITCOIN_ARCH}.tar.gz" -C /usr/local --strip-components=1 --exclude=*-qt \
    && rm -rf /tmp/bitcoin \
    && apt-get purge -y curl \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /root/.bitcoin

WORKDIR /app

# Copy built artifacts and dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/node_modules ./packages/server/node_modules
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/package.json ./packages/server/
COPY --from=builder /app/packages/web/dist ./packages/web/dist
COPY --from=builder /app/packages/web/package.json ./packages/web/
COPY --from=builder /app/package.json ./

# Expose ports
# 5173 - Web UI (static server)
# 18443 - Bitcoin RPC (regtest, optional for direct access)
EXPOSE 5173 18443

# Set environment variables
ENV NODE_ENV=production \
    PATH="/usr/local/bin:${PATH}"

# Verify installations
RUN node --version \
    && bitcoind --version

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD bitcoin-cli -regtest -rpcuser=test -rpcpassword=test123 getblockchaininfo || exit 1

# Add helpful labels
LABEL org.opencontainers.image.title="Bitcoin Regtest Environment" \
      org.opencontainers.image.description="Zero-config Bitcoin regtest with auto-mining and web UI - single container deployment" \
      org.opencontainers.image.url="https://github.com/Pessina/bitcoin-regtest" \
      org.opencontainers.image.vendor="Bitcoin Regtest" \
      bitcoin.version="30.0" \
      node.version="22"

# Start the server
CMD ["node", "packages/server/dist/cli.js"]
