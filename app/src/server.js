const EventEmitter = require('events')
const WebSocket = require('ws')
const url = require('url')
const fs = require('fs')
const http = require('http')
const getIp = require('./helper').getIp
const getHms = require('./helper').getHms

const express = require('express')
const rateLimit = require('express-rate-limit')
class Server extends EventEmitter {
  constructor(options, exchanges) {
    super()

    this.timestamps = {}
    this.connected = false
    this.chunk = []
    this.lockFetch = true
    this.storages = null;

    this.options = options

    if (!exchanges || !exchanges.length) {
      throw new Error('You need to specify at least one exchange to track')
    }

    this.ADMIN_IPS = []
    this.BANNED_IPS = []

    this.exchanges = exchanges

    this.queue = []

    this.notice = null
    this.stats = {
      trades: 0,
      volume: 0,
      hits: 0,
      unique: 0
    }

    this.initStorages().then(() => {
      if (this.options.collect) {
        console.log(
          `\n[server] collect is enabled`,
          this.options.websocket && this.options.aggr ? '\n\twill aggregate every trades that came on same ms (impact only broadcast)' : '',
          this.options.websocket && this.options.delay ? `\n\twill broadcast trades every ${this.options.delay}ms` : ''
        )
        console.log(
          `\tconnect to -> ${this.exchanges.map(a => a.id).join(', ')}`)
        this.handleExchangesEvents()
        this.connectExchanges()

        // profile exchanges connections (keep alive)
        this.profilerInterval = setInterval(this.monitorExchangesActivity.bind(this), 1000 * 60 * 3)

        if (this.storages) {
          const delay = this.scheduleNextBackup()
  
          console.log(
            `[server] scheduling first save to ${this.storages.map(storage => storage.constructor.name)} in ${getHms(delay)}...`
          )
        }
      }
      
      if (this.options.api || this.options.websocket) {
        this.createHTTPServer()
      }

      if (this.options.websocket) {
        this.createWSServer()
      }

      // update admin & banned ip
      this.updateIpsInterval = setInterval(this.updateIps.bind(this), 1000 * 60)

      if (this.options.api) {
        setTimeout(() => {
          console.log(`[server] Fetch API unlocked`)
  
          this.lockFetch = false
        }, 1000 * 60)
      }
    })
  }

  initStorages() {
    if (!this.options.storage) {
      return Promise.resolve();
    }

    this.storages = [];

    const promises = [];

    for (let name of this.options.storage) {
      console.log(`[storage] Using "${name}" storage solution`)

      if (this.options.api && this.options.storage.length > 1 && !this.options.storage.indexOf(name)) {
        console.log(`[storage] Set "${name}" as primary storage for API`)
      }

      let storage = new (require(`./storage/${name}`))(this.options);
  
      if (typeof storage.connect === 'function') {
        promises.push(storage.connect())
      } else {
        promises.push(Promise.resolve())
      }

      this.storages.push(storage);
    }

    return Promise.all(promises);
  }

  backupTrades(exitBackup) {
    if (!this.storages || !this.chunk.length) {
      this.scheduleNextBackup()
      return Promise.resolve()
    }

    const chunk = this.chunk.splice(0, this.chunk.length);
    
    return Promise.all(this.storages.map(storage => storage.save(chunk).then(() => {
      if (exitBackup) {
        console.log(`[server/exit] performed backup of ${chunk.length} trades into ${storage.constructor.name}`);
      }
    }))).then(() => {
      if (!exitBackup) {
        this.scheduleNextBackup()
      }
    })
  }

  scheduleNextBackup() {
    if (!this.storages) {
      return;
    }

    const now = new Date()
    let delay =
      Math.ceil(now / this.options.backupInterval) * this.options.backupInterval - now - 20

    if (delay < 1000) {
      delay += this.options.backupInterval
    }

    this.backupTimeout = setTimeout(this.backupTrades.bind(this), delay)

    return delay
  }

  handleExchangesEvents() {
    this.exchanges.forEach((exchange) => {
      exchange.on('data', (event) => {
        this.timestamps[event.exchange] = +new Date()

        Array.prototype.push.apply(this.chunk, event.data)
        
        if (!this.options.aggr) {
          if (!this.options.delay) {
            this.broadcast(event.data)
          } else {
            Array.prototype.push.apply(this.queue, event.data)
          }
        }
      })

      if (this.options.aggr) {
        exchange.on('data.aggr', (event) => {
          if (!this.options.delay) {
            this.broadcast(event.data)
          } else {
            Array.prototype.push.apply(this.queue, event.data)
          }
        })
      }

      exchange.on('open', (event) => {
        if (!this.connected) {
          console.log(`[warning] "${exchange.id}" connected but the server state was disconnected`)
          return exchange.disconnect()
        }

        this.broadcast({
          type: 'exchange_connected',
          id: exchange.id
        })
      })

      exchange.on('err', (event) => {
        this.broadcast({
          type: 'exchange_error',
          id: exchange.id,
          message: event.message
        })
      })

      exchange.on('close', (event) => {
        if (this.connected) {
          exchange.reconnect(this.options.pair)
        }

        this.broadcast({
          type: 'exchange_disconnected',
          id: exchange.id
        })
      })
    })
  }

  createWSServer() {
    if (!this.options.websocket) {
      return
    }

    this.wss = new WebSocket.Server({
      server: this.server
    })

    this.wss.on('listening', () => {
      console.log(`[server] websocket server listening at localhost:${this.options.port}`)
    })

    this.wss.on('connection', (ws, req) => {
      const ip = getIp(req)

      this.stats.hits++

      const data = {
        type: 'welcome',
        pair: this.options.pair,
        timestamp: +new Date(),
        exchanges: this.exchanges.map((exchange) => {
          return {
            id: exchange.id,
            connected: exchange.connected
          }
        })
      }

      if ((ws.admin = this.isAdmin(ip))) {
        data.admin = true
      }

      if (this.notice) {
        data.notice = this.notice
      }

      console.log(
        `[${ip}/ws${ws.admin ? '/admin' : ''}] joined ${req.url} from ${req.headers['origin']}`
      )

      this.emit('connections', this.wss.clients.size)

      ws.send(JSON.stringify(data))

      ws.on('close', (event) => {
        let error = null

        switch (event) {
          case 1002:
            error = 'Protocol Error'
            break
          case 1003:
            error = 'Unsupported Data'
            break
          case 1007:
            error = 'Invalid frame payload data'
            break
          case 1008:
            error = 'Policy Violation'
            break
          case 1009:
            error = 'Message too big'
            break
          case 1010:
            error = 'Missing Extension'
            break
          case 1011:
            error = 'Internal Error'
            break
          case 1012:
            error = 'Service Restart'
            break
          case 1013:
            error = 'Try Again Later'
            break
          case 1014:
            error = 'Bad Gateway'
            break
          case 1015:
            error = 'TLS Handshake'
            break
        }

        if (error) {
          console.log(`[${ip}] unusual close "${error}"`)
        }

        setTimeout(() => this.emit('connections', this.wss.clients.size), 100)
      })
    })
  }

  createHTTPServer() {
    const app = express()

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 30,
      handler: function(req, res) {
        return res.status(429).json({
          error: 'too many requests :v'
        })
      },
    })
    
    app.set('trust proxy', 1);

    app.all('/*', (req, res, next) => {
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

      if (req.headers['origin'] && !new RegExp(this.options.origin).test(req.headers['origin'])) {
        console.error(`[${ip}/BLOCKED] socket origin mismatch "${req.headers['origin']}"`)
        setTimeout(() => {
          return res.status(500).json({
            error: 'ignored'
          })
        }, 5000 + Math.random() * 5000)
      } else if (this.BANNED_IPS.indexOf(ip) !== -1) {
        console.error(`[${ip}/BANNED] at "${req.url}" from "${req.headers['origin']}"`)

        setTimeout(() => {
          return res.status(500).json({
            error: 'ignored'
          })
        }, 5000 + Math.random() * 5000)
      } else {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With')
        next()
      }
    })

    //  apply to all requests
    app.use(limiter)

    app.get('/', function (req, res) {
      res.json({
        message: 'hi'
      })
    })

    app.get('/:pair?/historical/:from/:to/:timeframe?/:exchanges?', (req, res) => {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      let from = req.params.from
      let to = req.params.to
      let timeframe = req.params.timeframe
      let exchanges = req.params.exchanges

      if (!this.options.api || !this.storages) {
        return res.status(501).json({
          error: 'no storage'
        })
      }

      const storage = this.storages[0];

      if (this.lockFetch) {
        setTimeout(() => {
          return res.status(425).json({
            error: 'try again'
          })
        }, Math.random() * 5000)

        return
      }

      if (isNaN(from) || isNaN(to)) {
        return res.status(400).json({
          error: 'missing interval'
        })
      }

      if (storage.format === 'point') {
        exchanges = exchanges ? exchanges.split('/') : []
        timeframe = parseInt(timeframe) || 1000 * 60 // default to 1m

        from = Math.floor(from / timeframe) * timeframe
        to = Math.ceil(to / timeframe) * timeframe

        const length = (to - from) / timeframe;
  
        if (length > this.options.maxFetchLength) {
          return res.status(400).json({
            error: 'too many bars'
          })
        }
      } else {
        from = parseInt(from)
        to = parseInt(to)
      }

      if (from > to) {
        let _from = parseInt(from)
        from = parseInt(to)
        to = _from
      }

      const fetchStartAt = +new Date()

      ;(storage ? storage.fetch(from, to, timeframe, exchanges) : Promise.resolve([]))
        .then((output) => {
          if (to - from > 1000 * 60) {
            console.log(
              `[${ip}] requesting ${getHms(to - from)} (${output.length} ${
                storage.format
              }s, took ${getHms(+new Date() - fetchStartAt)})`
            )
          }

          if (storage.format === 'trade') {
            for (let i = 0; i < this.chunk.length; i++) {
              if (this.chunk[i][1] <= from || this.chunk[i][1] >= to) {
                continue
              }

              output.push(this.chunk[i])
            }
          }

          return res.status(200).json({
            format: storage.format,
            results: output
          })
        })
        .catch((error) => {
          return res.status(500).json({
            error: error.message
          })
        })
    })

    this.server = app.listen(this.options.port, () => {
      console.log(`[server] http server listening at localhost:${this.options.port}`, !this.options.api ? '(historical api is disabled)' : '')
    })

    this.app = app
  }

  connectExchanges() {
    console.log('\n[server] listen', this.options.pair)

    this.connected = true
    this.chunk = []

    this.exchanges.forEach((exchange) => {
      exchange.connect(this.options.pair)
    })

    if (this.options.delay) {
      this.delayInterval = setInterval(() => {
        if (!this.queue.length) {
          return
        }

        this.broadcast(this.queue)

        this.queue = []
      }, this.options.delay || 1000)
    }
  }

  broadcast(data) {
    if (!this.wss) {
      return
    }

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data))
      }
    })
  }

  disconnectExchanges() {
    console.log('[server] disconnect exchanges')

    clearInterval(this.delayInterval)

    this.connected = false

    this.exchanges.forEach((exchange) => {
      exchange.disconnect()
    })

    this.queue = []
  }

  monitorExchangesActivity() {
    const now = +new Date()

    this.exchanges.forEach((exchange) => {
      if (!exchange.connected) {
        return
      }

      if (!this.timestamps[exchange.id]) {
        console.log('[warning] no data sent from ' + exchange.id)
        exchange.disconnect() && exchange.reconnect(this.options.pair)

        return
      }

      if (now - this.timestamps[exchange.id] > 1000 * 60 * 5) {
        console.log('[warning] ' + exchange.id + " hasn't sent any data since more than 5 minutes")

        delete this.timestamps[exchange.id]

        exchange.disconnect() && exchange.reconnect(this.options.pair)

        return
      }
    })
  }

  isAdmin(ip) {
    if (this.options.admin === 'all' || ['localhost', '127.0.0.1', '::1'].indexOf(ip) !== -1) {
      return true
    }

    if (this.options.admin !== 'whitelist') {
      return false
    }

    return this.ADMIN_IPS.indexOf(ip) !== -1
  }

  updateIps() {
    const files = {
      ADMIN_IPS: '../admin.txt',
      BANNED_IPS: '../banned.txt'
    }

    Object.keys(files).forEach((name) => {
      if (fs.existsSync(files[name])) {
        const file = fs.readFileSync(files[name], 'utf8')

        if (!file || !file.trim().length) {
          return false
        }

        this[name] = file.split('\n')
      } else {
        this[name] = []
      }
    })
  }
}

module.exports = Server
