# Builder Stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first to leverage Docker cache
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript code
RUN npm run build

# Production Stage
FROM node:18-alpine AS production

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port
EXPOSE 8080

# Set the default environment (Heroku will override this)
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]
