# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port Vite uses
EXPOSE 5173

# Start Vite and expose to outside
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
