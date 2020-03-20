app_name := "significant-trades-server"
docker_user_id := "dmi7ry"
docker_image_name := docker_user_id + "/" + app_name + ":" + app_version
build_date := `date -u +"%Y-%m-%dT%H:%M:%SZ"`
commit := `git rev-parse --short HEAD`
app_version := `date -u +"%d.%m.%y"`

app_forward:
  cd app && \
  git pull

alias rmi := images-clean-unused
alias rmis := remove-images
alias rmf := containers-clean-all
alias v := version
alias bump := increment-version

# tight everything up, commit, test and release
release +comment:
	@echo "{{comment}}"
	git add -A
	git commit -m "{{comment}}"
	just build-test
	git push origin

_build BUILD_ARGS="--squash --no-cache" DOCKERFILE=".":
	docker build {{BUILD_ARGS}} -t {{docker_image_name}} \
	--build-arg EXPORTER_VERSION={{app_version}} \
	--build-arg BUILD_DATE={{build_date}} \
	--build-arg VCS_REF={{commit}} -f {{DOCKERFILE}} .
build-c: (_build "--squash" "Dockerfile-minimal")
build-nc: (_build "--squash --no-cache")

bash:
  docker run -it --rm --name {{app_name}} {{docker_image_name}} sh
compose:
  docker-compose up -d {{app_name}}
compose-down:
  docker-compose down
logs:
  docker logs {{app_name}}

push IMAGE=(docker_image_name):
	docker push {{IMAGE}}
publish: build-nc push

dive:
  dive {{docker_image_name}}

clean: containers-clean-all images-clean-unused remove-images
	docker ps -a
	docker images
images-clean-unused:
	docker images | grep none | awk '{ print $3 }' | xargs -I{} docker rmi {}
containers-clean-all:
	docker ps -aq | xargs -I{} docker rm -f {}
remove-image image=(docker_image_name):
	docker rmi {{image}}
remove-images:
	@docker images | grep {{app_name}} | awk '{ print $3 }' | xargs -I{} docker rmi {}


# print current image version
version:
	@echo {{docker_image_name}}

# increment version
increment-version ver="patch":
	@echo 'before: {{docker_image_name}}'
	npm version {{ver}} --no-git-tag-version
