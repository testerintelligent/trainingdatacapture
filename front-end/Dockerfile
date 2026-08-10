#use the official nodejs image for build the react app
FROM node:18 AS build

#set working directory
WORKDIR /app

#copy the package.json and install dependencies
COPY package.json ./
RUN npm install

#copy the rest of the app code
COPY . .

# Build-time environment selector: 'development' or 'production'.
# CRA's `npm run build` always runs internally with NODE_ENV=production and
# only reads .env.production(.local) files - it never picks up .env.development.
# So to bake in the dev config, copy .env.development over .env.production.local,
# which is CRA's highest-priority env file and overrides .env.production.
ARG BUILD_ENV=production
RUN if [ "$BUILD_ENV" = "development" ]; then cp .env.development .env.production; fi

#build the react app
RUN npm run build

#serve the app with nginx
FROM nginx:alpine

#copy the build folder to the nginx html folder
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 82




