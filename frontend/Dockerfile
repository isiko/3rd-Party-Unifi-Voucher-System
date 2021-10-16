FROM node:16-alpine AS builder

#Load Variables from Build Arguments
ARG REACT_APP_BACKEND_PORT
ARG REACT_APP_BACKEND_URL
ARG REACT_APP_SYSTEM_NAME
ARG REACT_APP_GENERAL_ERROR_MESSAGE
ARG REACT_APP_NOT_FOUND_ERROR_MESSAGE

#Set Enviroment Variables
ENV NODE_ENV production

ENV REACT_APP_BACKEND_PORT $REACT_APP_BACKEND_PORT
ENV REACT_APP_BACKEND_URL $REACT_APP_BACKEND_URL
ENV REACT_APP_SYSTEM_NAME $REACT_APP_SYSTEM_NAME
ENV REACT_APP_GENERAL_ERROR_MESSAGE $REACT_APP_GENERAL_ERROR_MESSAGE
ENV REACT_APP_NOT_FOUND_ERROR_MESSAGE $REACT_APP_NOT_FOUND_ERROR_MESSAGE

# Add a work directory
WORKDIR /app/frontend

# Cache and Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm ci --only=production

# Copy app files
COPY . .

# Build the app
RUN npm run build

# Bundle static assets with nginx
FROM nginx:1.21.0-alpine as production

ENV NODE_ENV production

# Copy built assets from builder
COPY --from=builder /app/frontend/build /usr/share/nginx/html

# Add your nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]