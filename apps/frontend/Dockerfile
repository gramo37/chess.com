# Use an official Node.js runtime as a parent image
FROM node:16

# Build args
ARG VITE_BACKEND_URL
ARG VITE_WS_URL

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

RUN echo "REACT_APP_API_URL=$VITE_BACKEND_URL" >> .env \
    && echo "REACT_APP_API_PORT=$VITE_WS_URL" >> .env

# Build the application
RUN npm run build

# Use an official nginx image as the base image
FROM nginx:alpine

# Copy the build output to the nginx html directory
COPY --from=0 /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Command to run the app
CMD ["nginx", "-g", "daemon off;"]
