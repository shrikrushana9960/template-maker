# Use an official Node.js image as the base
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Expose ports for Vite and JSON Server
EXPOSE 5173 3001

CMD ["npx", "concurrently", "\"npm run dev\"", "\"npm run start\""]


