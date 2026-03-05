FROM node:18

WORKDIR /app

# package files copy
COPY package*.json ./

# install dependencies
RUN npm install

# copy project
COPY . .

# build nest project
RUN npm run build

# expose port
EXPOSE 5000

# start app
CMD ["node", "dist/main.js"]