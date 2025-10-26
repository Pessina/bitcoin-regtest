# Stage 1: Build
FROM node:22-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files for dependency installation
COPY package.json yarn.lock ./
COPY packages/server/package.json ./packages/server/
COPY packages/web/package.json ./packages/web/

# Install dependencies
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy source and build
COPY . .
RUN yarn build

# Stage 2: Runtime
FROM node:22-slim

ARG BITCOIN_VERSION=30.0

# Install Bitcoin Core
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && mkdir -p /tmp/bitcoin \
    && cd /tmp/bitcoin \
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
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /root/.bitcoin

WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/node_modules ./packages/server/node_modules
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/package.json ./packages/server/
COPY --from=builder /app/packages/web/dist ./packages/web/dist
COPY --from=builder /app/package.json ./

# Expose ports: Web UI + Bitcoin RPC
EXPOSE 5173 18443

ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD bitcoin-cli -regtest -rpcuser=test -rpcpassword=test123 getblockchaininfo || exit 1

CMD ["node", "packages/server/dist/cli.js"]
