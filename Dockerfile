# Use Node.js slim image as base
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build TypeScript code
RUN npm run build

# Expose default port (can be overridden by environment)
EXPOSE 1337

# Start the application
CMD ["npm", "start"] 