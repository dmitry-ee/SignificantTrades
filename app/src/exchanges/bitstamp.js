const Exchange = require('../exchange')
const WebSocket = require('ws')

class Bitstamp extends Exchange {
  constructor(options) {
    super(options)

    this.id = 'bitstamp'

    this.pairs = [
      'LTCUSD',
      'ETHUSD',
      'XRPEUR',
      'BCHUSD',
      'BCHEUR',
      'BTCEUR',
      'XRPBTC',
      'EURUSD',
      'BCHBTC',
      'LTCEUR',
      'BTCUSD',
      'LTCBTC',
      'XRPUSD',
      'ETHBTC',
      'ETHEUR'
    ]

    this.mapping = pair => {
      if (this.pairs.indexOf(pair) !== -1) {
        return pair.toLowerCase()
      }

      return false
    }

    this.options = Object.assign(
      {
        url: () => {
          return `wss://ws.bitstamp.net`
        }
      },
      this.options
    )
  }

  connect(pair) {
    if (!super.connect(pair)) return

    this.api = new WebSocket(this.getUrl())

    this.api.onmessage = event => this.emitData(this.format(JSON.parse(event.data)))

    this.api.onopen = event => {
      this.api.send(
        JSON.stringify({
          event: 'bts:subscribe',
          data: {
            channel: 'live_trades_' + this.pair
          }
        })
      )

      this.emitOpen(event)
    }

    this.api.onclose = event => {
      this.emitClose(event)

      clearInterval(this.keepalive)
    }

    this.api.onerror = this.emitError.bind(this, { message: 'Websocket error' })
  }

  disconnect() {
    if (!super.disconnect()) return

    if (this.api && this.api.readyState < 2) {
      this.api.close()
    }
  }

  format(json) {
    const trade = json.data

    if (!trade || !trade.amount) {
      return
    }

    return [
      [
        this.id,
        +new Date(trade.microtimestamp / 1000),
        trade.price,
        trade.amount,
        trade.type === 0 ? 1 : 0
      ]
    ]
  }
}

module.exports = Bitstamp
