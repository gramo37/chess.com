FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
# Install TypeScript globally
RUN npm install -g typescript
RUN npm install -g ts-node

COPY . .

# RUN npm run build
RUN tsc -b
RUN ts-node src/tools/copyAssets

EXPOSE 5000
CMD ["npm", "start"]