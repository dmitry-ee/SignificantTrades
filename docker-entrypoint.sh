#!/bin/bash

#TODO: remove config.json building process from docker entrypoint

RED='\033[0;31m'  # Red color
NC='\033[0m'      # No Color

echo -e "\nHELLO THERE! THIS IS SIGNIFICANT TRADES SERVER"
echo -e "Project ${RED}https://github.com/Tucsky/SignificantTrades/${NC}"
echo -e "Liked? Donate: ${RED}BTC:3GLyZHY8gRS96sH4J9Vw6s1NuE4tWcZ3hX${NC}\n"

if [ ! -z "$VERBOSE" ]; then
  printenv
  set -ex
fi

if [ -z "$DEFAULT_PORT" ]; then
  DEFAULT_PORT="3000"
  echo "DEFAULT_PORT is not set, using $DEFAULT_PORT by default"
fi
if [ -z "$DELAY" ]; then
  DELAY="200"
  echo "DELAY is not set, using $DELAY by default"
fi
if [ -z "$DEFAULT_PAIR" ]; then
  DEFAULT_PAIR="BTCUSD"
  echo "DEFAULT_PAIR is not set, using $DEFAULT_PAIR by default"
fi
if [ -z "$ORIGIN" ]; then
  ORIGIN="*"
  echo "ORIGIN is not set, using $ORIGIN by default"
fi

if [[ ! -f "config.json" ]]; then
  echo "{ \"port\": \"$DEFAULT_PORT\", \"delay\":\"$DELAY\", \"pair\":\"$DEFAULT_PAIR\", \"origin\":\"$ORIGIN\" }" > "config.json"
  echo "successfuly created config.json file: >"
  cat ./config.json
fi

echo "LISTENING $DEFAULT_PORT FOR PAIR $DEFAULT_PAIR"

if [[ "$1" == "run" ]]; then
  exec node index
fi

exec "$@"
