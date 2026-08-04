# ---- Build stage ----
FROM node:20-slim AS builder

# Prisma needs OpenSSL to generate/query engines.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install all deps (incl. dev) for the build.
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build (prisma generate + tsc).
COPY . .
RUN npm run build

# Remove dev dependencies to slim the node_modules we copy forward.
RUN npm prune --omit=dev

# ---- Runtime stage ----
FROM node:20-slim AS runner

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

EXPOSE 8080

# Uses node (no extra packages) to probe the /health endpoint.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||8080)+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/server.js"]
