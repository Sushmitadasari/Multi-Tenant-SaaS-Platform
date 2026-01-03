# Changed from 18 to 22
FROM node:22-alpine 

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# We set the command in package.json, so this runs that script
CMD ["npm", "run", "dev"]