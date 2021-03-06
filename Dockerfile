FROM node:12.13.1-alpine
WORKDIR /opt/app
ENV NODE_ENV production
COPY package*.json ./
RUN npm ci --only=production
COPY --chown=node:node index.js ./
USER node
CMD ["index"]

