#use the offical node.js image
FROM node:18

#set the working directory in the container
WORKDIR /usr/src/app

#install dependencies
COPY package.json ./
RUN npm install

# Build the application
# RUN npm run build

#Copy the rest of the application code
COPY . .

#Expose the backend port
EXPOSE 5002

# Default if the container is run standalone without an env var passed in.
# docker-compose overrides this via the `environment:` block (which in turn
# is fed by the Jenkins ENVIRONMENT parameter).
ENV NODE_ENV=production

# Run node directly (not `npm start`) so the container's NODE_ENV is respected.
# `npm start` hardcodes NODE_ENV=production in package.json and would silently
# override whatever was passed in.
CMD ["node", "index.js"]
