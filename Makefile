.EXPORT_ALL_VARIABLES:
APP_VERSION			= $(shell git describe --abbrev=0 --tags)
APP_NAME				= significant-trades-server
ENV_DIR					= ./docker
DOCKER_ID_USER	= dmi7ry

#.DEFAULT_GOAL := set-env

#.PHONY:

#set-env:
#	export $(shell $(grep -v '^#' ${ENV_DIR}/${ENV_FILE} | xargs) )

all: build up

build:
	docker-compose build

release:
	export APP_VERSION=latest ;\
	docker-compose build

up:
	docker-compose up -d $(APP_NAME)

down:
	docker-compose down

run:
	docker-compose --verbose up $(APP_NAME)
stop:
	docker-compose stop $(APP_NAME)

shell:
	docker exec -it $(APP_NAME) bash

push-latest:
	export APP_VERSION=latest ;\
	docker-compose push

push:
	docker-compose push

publish: build push release push-latest
