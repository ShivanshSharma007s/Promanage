FROM node:20-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Install frontend dependencies and build
WORKDIR /app/frontend
RUN npm install --include=dev
RUN npx vite build

# Back to backend for runtime
WORKDIR /app/backend

# Push DB schema and start server
CMD npx prisma db push && node server.js
