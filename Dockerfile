FROM node:boron

# Create app directory
RUN mkdir -p /var/www/wordz-purchase
WORKDIR /var/www/wordz-purchase

# Install app dependencies
COPY package.json /var/www/wordz-purchase
RUN npm install

# Bundle app source
COPY . /var/www/wordz-api

EXPOSE 3010

CMD [ "npm", "run", "start" ]
