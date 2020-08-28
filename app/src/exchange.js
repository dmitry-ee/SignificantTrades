const EventEmitter = require('events')
const WebSocket = require('ws')

class Exchange extends EventEmitter {
  constructor(options) {
    super()

    this.connected = false
    this.reconnectionDelay = 5000
    this.baseReconnectionDelay = this.reconnectionDelay

    this.options = Object.assign(
      {
        // default exchanges options
      },
      options || {}
    )
  }

  connect(pair, reconnection) {
    if (this.connected) {
      console.error(`[${this.id}] already connected`)
      return
    }

    this.pair = null

    if (this.mapping) {
      if (typeof this.mapping === 'function') {
        this.pair = this.mapping(pair)
      } else {
        this.pair = this.mapping[pair]
      }

      if (!this.pair) {
        console.log(`[${this.id}] unknown pair ${pair}`)

        this.emit('err', new Error(`Unknown pair ${pair}`))

        return false
      }
    }

    console.log(`[${this.id}] ${reconnection ? 're' : ''}connecting... (${this.pair})`)

    return true
  }

  disconnect() {
    clearTimeout(this.reconnectionTimeout)

    return true
  }

  reconnect(pair) {
    clearTimeout(this.reconnectionTimeout)

    if (this.connected) {
      return
    }

    console.log(`[${this.id}] schedule reconnection (${this.reconnectionDelay} ms)`)

    this.reconnectionTimeout = setTimeout(() => {
      if (!this.connected) {
        this.connect(pair, true)
      }
    }, this.reconnectionDelay)

    this.reconnectionDelay = Math.min(1000 * 60 * 2, this.reconnectionDelay * 1.5)
  }

  emitOpen(event) {
    console.log(`[${this.id}] connected`)

    this.connected = true

    this.reconnectionDelay = this.baseReconnectionDelay

    this.emit('open', event)
  }

  emitData(trades) {
    if (!trades || !trades.length) {
      return
    }

    this.emit('data', {
      exchange: this.id,
      data: trades
    })  

    if (!this.options.aggr) {
      return
    }

    const output = []

    for (let i = 0; i < trades.length; i++) {
      const trade = trades[i]

      if (trade[5]) {
        if (this.queueTrades) {
          this.queuedTrade[2] /= this.queuedTrade[3]
          output.push(this.queuedTrade)
          delete this.queuedTrade
          clearTimeout(this.queuedTradeTimeout)
          delete this.queuedTradeTimeout
        }
        output.push(trade)
        continue
      }

      if (this.queuedTrade) {
        if (trade[1] > this.queuedTrade[1] || trade[4] !== this.queuedTrade[4]) {
          this.queuedTrade[2] /= this.queuedTrade[3]
          output.push(this.queuedTrade)
          this.queuedTrade = trade.slice(0, trade.length)
          this.queuedTrade[2] *= this.queuedTrade[3]
          clearTimeout(this.queuedTradeTimeout)
          delete this.queuedTradeTimeout
        } else if (trade[1] <= this.queuedTrade[1] && trade[4] === this.queuedTrade[4]) {
          this.queuedTrade[3] += +trade[3]
          this.queuedTrade[2] += trade[2] * trade[3]
        }
      } else {
        this.queuedTrade = trade.slice(0, trade.length)
        this.queuedTrade[2] *= this.queuedTrade[3]
      }
    }

    if (this.queuedTrade && !this.queuedTradeTimeout) {
      this.queuedTradeTimeout = setTimeout(() => {
        this.queuedTrade[2] /= this.queuedTrade[3]
        this.emit('data.aggr', {
          exchange: this.id,
          data: [this.queuedTrade]
        })  
        delete this.queuedTrade
        delete this.queuedTradeTimeout
      }, 50)
    }

    if (output.length) {
      this.emit('data.aggr', {
        exchange: this.id,
        data: output
      })  
    }
  }

  toFixed(number, precision) {
    var factor = Math.pow(10, precision)
    return Math.ceil(number * factor) / factor
  }

  emitError(error) {
    console.error(`[${this.id}] error`, error.message)

    this.emit('err', error)
  }

  emitClose(event) {
    console.log(`[${this.id}] closed`)

    this.connected = false

    this.emit('close', event)
  }

  getUrl() {
    return typeof this.options.url === 'function'
      ? this.options.url.apply(this, arguments)
      : this.options.url
  }

  format(data) {
    return data
  }
}

module.exports = Exchange
