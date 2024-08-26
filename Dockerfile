# Use the official Bun image from Docker Hub
FROM oven/bun:latest

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and bun.lockb files first to leverage Docker cache
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY ./src ./src

# Expose the port the app runs on
EXPOSE 3005

# Command to run the application
CMD ["bun", "run", "src" "index.ts"]
