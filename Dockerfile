FROM        mhart/alpine-node:10
ARG         APP_DIR=/app
ARG         DATA_DIR=/data
ARG         ENV_DIR=./docker
ARG         USER_NAME=sig-trades

WORKDIR     $APP_DIR

COPY        ${APP_DIR}                        ${APP_DIR}
COPY        ${ENV_DIR}/docker-entrypoint.sh   ${APP_DIR}

RUN         set -ex ;\
            addgroup -g 1000 -S ${USER_NAME} ;\
            adduser -u 1000 -S $USER_NAME -G ${USER_NAME} ;\
            mkdir ${APP_DIR}${DATA_DIR} ;\
            chown -R ${USER_NAME}:${USER_NAME} ${APP_DIR} ;\
            chmod +rw ${APP_DIR}${DATA_DIR} ;\
            apk add --no-cache bash ;\
            npm install ;\
            chmod +x docker-entrypoint.sh

VOLUME ["${APP_DIR}${DATA_DIR}"]

ENV         PATH=.:$PATH

USER        ${USER_NAME}

ENTRYPOINT  ["docker-entrypoint.sh"]

CMD ["run"]
