.EXPORT_ALL_VARIABLES:
APP_VERSION			= $(shell git describe --abbrev=0 --tags)
APP_NAME				= significant-trades-server
APP_DIR					= /app
DOCKER_ID_USER	= dmi7ry

#.DEFAULT_GOAL := set-env

#.PHONY:

all: build up

build:
	docker-compose build
build-arm:
	docker build -t $(DOCKER_ID_USER)/$(APP_NAME):$(APP_VERSION)-arm -f Dockerfile-arm .

config:
	docker-compose config

build-verbose:
	docker-compose --verbose build

release:
	export APP_VERSION=latest ;\
	docker-compose build

up:
	docker-compose up -d $(APP_NAME)

down:
	docker-compose down

run:
	docker-compose up $(APP_NAME)
stop:
	docker-compose stop $(APP_NAME)
STAHP: stop remove

shell:
	docker exec -it $(APP_NAME) bash

remove:
	docker-compose rm $(APP_NAME)

logs:
	docker logs $(APP_NAME)

push-latest:
	export APP_VERSION=latest ;\
	docker-compose push

push:
	docker-compose push

publish: build push release push-latest
