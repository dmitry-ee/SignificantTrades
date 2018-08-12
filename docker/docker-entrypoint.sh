#!/bin/bash

#TODO: remove config.json building from docker entrypoint

set -ex

if [ -z "$DEFAULT_PORT" ]; then
  DEFAULT_PORT="3000"
  echo "DEFAULT_PORT is not set, using $DEFAULT_PORT by default"
fi
if [ -z "$DELAY" ]; then
  DELAY="200"
  echo "DELAY is not, using $DELAY by default"
fi
if [ -z "$DEFAULT_PAIR" ]; then
  DEFAULT_PAIR="BTCUSD"
  echo "DEFAULT_PAIR is not, using $DEFAULT_PAIR by default"
fi
if [ -z "$ORIGIN" ]; then
  ORIGIN="*"
  echo "ORIGIN is not, using $ORIGIN by default"
fi

printenv

if [[ ! -f "config.json" ]]; then
  echo "{ \"port\": \"$DEFAULT_PORT\", \"delay\":\"$DELAY\", \"pair\":\"$DEFAULT_PAIR\", \"origin\":\"$ORIGIN\" }" > "config.json"
  echo "successfuly created config.json file: >"
  cat ./config.json
fi


if [[ "$1" == "run" ]]; then
  exec node index
fi

exec "$@"
