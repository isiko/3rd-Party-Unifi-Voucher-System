FROM node:16-alpine AS backend

# Create app directory
WORKDIR /app/backend

# Install app dependencies
COPY start.sh .
COPY package.json .
COPY package-lock.json .
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000

CMD [ "sh","start.sh" ]