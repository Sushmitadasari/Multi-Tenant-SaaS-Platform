# Use Node.js image to build the app
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the React port
EXPOSE 3000

# Start React
CMD ["npm", "start"]