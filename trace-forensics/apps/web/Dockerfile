FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port
EXPOSE 3000

# Start dev server for testing/development
CMD ["npm", "run", "dev", "--", "--host"]
