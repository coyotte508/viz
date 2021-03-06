FROM node:6.10.3-alpine

WORKDIR /app

COPY package.json package.config.js webpack.config.js /app/

RUN apk add --no-cache fontconfig && \
    apk add --no-cache --virtual .build-dependencies curl git && \
    curl -Ls "https://github.com/tidepool-org/tools/raw/master/alpine_phantomjs_dependencies/dockerized-phantomjs.tar.xz" | tar xJ -C / && \
    mkdir /app/dist && mkdir /app/node_modules && chown node:node -R /app && \
    apk del .build-dependencies && \
    rm -rf /usr/share/man /tmp/* /var/tmp/* /root/.npm /root/.node-gyp

USER node

COPY . /app

RUN yarn install

VOLUME /app

EXPOSE 8081 8082

CMD ["npm", "start"]
