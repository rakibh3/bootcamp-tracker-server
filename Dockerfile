# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (including devDependencies for build)
COPY package.json pnpm-lock.yaml ./
# Install pnpm globaly
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Run the application
FROM node:22-alpine AS runner

WORKDIR /app

# Install pnpm globaly
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts from builder stage (using dist as per package.json build script)
COPY --from=builder /app/dist ./dist

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["node", "dist/server.js"]
