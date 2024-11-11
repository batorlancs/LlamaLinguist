# FROM node:18-alpine

# WORKDIR /app

# # Copy package files
# COPY package*.json ./
# RUN npm install

# # Copy the rest of the frontend code
# COPY . .

# # Build the Next.js app
# RUN npm run build

# # Start the app
# CMD ["npm", "start"]

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the Vite app
RUN npm run build

# Start the app in production mode using Vite's preview command
CMD ["npm", "run", "preview"]