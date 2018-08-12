

## How to install & run the server
1. Clone the repo

```bash
git clone https://github.com/Tucsky/SignificantTrades -b server server/
```

2. Install server dependencies & run it

```bash
cd server/app
npm install
node index
```

3. Install client dependencies then run

```bash
cd client
npm install
npm run dev
```

4. Open a browser window at localhost:8080

...

5. Profit !

## Configuration

All settings are optional and can be changed in the [server configuration file](server/config.json.example) (rename config.json.example into config.json as the real config file is untracked on github).

```js
{
  // the port which the server will be at
  "port": 3000,

  // delay (in ms) between server broadcasts to avoid large event saturation
  "delay": 200, // (the larger the better performance wise)

  // default pair it should use
  "pair": "BTCUSD"
}
```

## Docker

You also can run server inside Docker container

### Dependencies
- [Docker](https://docs.docker.com/install/) 18.06.0+
- [Docker Compose](https://docs.docker.com/compose/install/) 1.22.0+
- [Gnu Make](https://www.gnu.org/software/make/) 4.1+

### Usage

### Run container standalone (without Docker Compose)
*Much simplier way than run compared to Docker Compose*
```shell
export PORT=1750 ;\
export DATA_DIR="$PWD/data" ;\
export PAIR="RLCBTC" ;\
  mkdir -p $DATA_DIR ;\
  docker pull dmi7ry/significant-trades-server:latest ;\
  docker run --rm -d \
    -e DEFAULT_PORT=$PORT \
    -e DEFAULT_PAIR=$PAIR \
    -p $PORT:$PORT \
    -v $DATA_DIR:/app/data \
    --name significant-trades-server-$PAIR \
    dmi7ry/significant-trades-server:latest
```

### Docker Compose (for dev purposes)

#### Variables
You should check variables at `docker/.env`

That's simply shell-like variables
```shell
DEFAULT_PORT=1750
DEFAULT_PAIR=BTCUSD
DELAY=500
ORIGIN=*
```
Or/and inside `docker-compose.yml`
```yaml
env_file:
  - ${ENV_DIR}/.env
environment:
  - DEFAULT_PORT=5000
  - DEFAULT_PAIR=BTCUSD
```

#### Build
```shell
make build
```

#### Run
```shell
# interactive mode
make run
# non-interactive|service run
make up
```
**NOTE** Container will run with **NAME** as described in `docker-compose.yml` `services.[]` variable

#### Stop
```shell
# stop container
make stop
# stop and remove container
make STAHP
```

#### Diving into container
```shell
make shell
```

#### Publish container to Docker Hub
```shell
make publish
```
**NOTE**: Before publish you need to [register](https://hub.docker.com) and login on your workstation with
```shell
docker login
```
**NOTE**: Image will publish with latest tag from repo via `git describe --abbrev=0 --tags` and tag `latest`

*Like whats been done here ?* Donate BTC (segwit)<br>
[3NuLQsrphzgKxTBU3Vunj87XADPvZqZ7gc](bitcoin:3NuLQsrphzgKxTBU3Vunj87XADPvZqZ7gc)
