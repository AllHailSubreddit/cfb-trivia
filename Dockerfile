FROM node:12.7.0-alpine
WORKDIR /opt/app
COPY package*.json ./
COPY index.js ./
RUN npm ci --only=production
CMD node index.js