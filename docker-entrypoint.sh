#!/bin/bash

#TODO: remove config.json building process from docker entrypoint

RED='\033[0;31m'  # Red color
NC='\033[0m'      # No Color

echo -e "\nHELLO THERE! THIS IS SIGNIFICANT TRADES SERVER"
echo -e "Project ${RED}https://github.com/Tucsky/SignificantTrades/${NC}"
echo -e "Liked? Donate: ${RED}BTC:3GLyZHY8gRS96sH4J9Vw6s1NuE4tWcZ3hX${NC}\n"

if [ ! -z "$STS_VERBOSE" ]; then
  printenv
  set -ex
fi

if [ -z "$STS_DEFAULT_PORT" ]; then
  STS_DEFAULT_PORT="3000"
  echo "STS_DEFAULT_PORT is not set, using $STS_DEFAULT_PORT by default"
fi
if [ -z "$STS_DELAY" ]; then
  STS_DELAY="200"
  echo "STS_DELAY is not set, using $STS_DELAY by default"
fi
if [ -z "$STS_DEFAULT_PAIR" ]; then
  STS_DEFAULT_PAIR="BTC/USD"
  echo "STS_DEFAULT_PAIR is not set, using $STS_DEFAULT_PAIR by default"
fi
if [ -z "$STS_ORIGIN" ]; then
  STS_ORIGIN="*"
  echo "STS_ORIGIN is not set, using $STS_ORIGIN by default"
fi
if [[ $STS_DEFAULT_PAIR = *"/"* ]]; then
  STS_DEFAULT_PAIR="${STS_DEFAULT_PAIR//[\/]}"
else
  echo "STS_DEFAULT_PAIR=${STS_DEFAULT_PAIR} DOESN'T CONTAIN '/' SYMBOL, DOESN'T MATTER BUT COMPABILITY WITH OTHER STUFF WILL LOST"
fi

if [[ ! -f "config.json" ]]; then
  echo "{ \"port\": \"$STS_DEFAULT_PORT\", \"delay\":\"$STS_DELAY\", \"pair\":\"$STS_DEFAULT_PAIR\", \"origin\":\"$STS_ORIGIN\", \"backupInterval\":0 }" > "config.json"
  echo "successfuly created config.json file: >"
  cat ./config.json
fi

echo "LISTENING $STS_DEFAULT_PORT FOR PAIR $STS_DEFAULT_PAIR"

if [[ "$1" == "run" ]]; then
  exec node index
fi

exec "$@"
