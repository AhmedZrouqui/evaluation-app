FROM node:18-alpine as builder

WORKDIR /usr/src/app

# Copy package files first to leverage Docker cache
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript code
RUN npm run build

# Development stage
FROM node:18-alpine as development

WORKDIR /usr/src/app

# Copy configuration files
COPY package*.json ./
COPY tsconfig.json ./
COPY nodemon.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code for development
COPY . .

# Production stage
FROM node:18-alpine as production

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY .env ./

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["node", "dist/index.js"]