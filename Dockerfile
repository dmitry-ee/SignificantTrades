FROM        mhart/alpine-node:10
ARG         APP_DIR=/app
ARG         SRC_DIR=src
ARG         ENV_DIR=./docker
ARG         USER_NAME=sig-trades

WORKDIR     $APP_DIR

COPY        ./package.json                    ${APP_DIR}
COPY        ./index.js                        ${APP_DIR}
COPY        ${SRC_DIR}                        ${APP_DIR}/${SRC_DIR}
COPY        ${ENV_DIR}/docker-entrypoint.sh   ${APP_DIR}

RUN         set -ex ;\
            addgroup -g 1000 -S ${USER_NAME} ;\
            adduser -u 1000 -S $USER_NAME -G ${USER_NAME} ;\
            chown -R ${USER_NAME}:${USER_NAME} ${APP_DIR} ;\
            apk add --no-cache bash ;\
            npm install ;\
            chmod +x docker-entrypoint.sh

#VOLUME ["/data"]

ENV         PATH=.:$PATH

USER        ${USER_NAME}

ENTRYPOINT  ["docker-entrypoint.sh"]

CMD ["run"]
