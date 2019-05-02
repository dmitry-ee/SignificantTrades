FROM        mhart/alpine-node:10
ARG         APP_DIR=/app

WORKDIR     $APP_DIR

COPY        docker-entrypoint.sh ${APP_DIR}/package.json         ${APP_DIR}/

RUN         set -ex ;\
            apk add bash ;\
            npm install ;\
            chmod +x docker-entrypoint.sh ;\
            rm -rf /var/lib/apt/lists/* ;\
            rm -rf /var/cache/apk/*

ENV         PATH=.:$PATH

COPY        ${APP_DIR}/src      ${APP_DIR}/src
COPY        ${APP_DIR}/index.js ${APP_DIR}/config.json.example   ${APP_DIR}/

ENTRYPOINT  ["docker-entrypoint.sh"]

CMD ["run"]
