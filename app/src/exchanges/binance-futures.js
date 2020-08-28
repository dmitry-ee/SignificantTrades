const Exchange = require('../exchange')
const WebSocket = require('ws')

class BinanceFutures extends Exchange {
  constructor(options) {
    super(options)

    this.id = 'binance_futures'

    this.pairs = ['BTCUSDT']

    this.mapping = pair => {
      pair = pair.replace(/USD$/, 'USDT')

      if (this.pairs.indexOf(pair) !== -1) {
        return pair.toLowerCase()
      }

      return false
    }

    this.options = Object.assign(
      {
        url: () => {
          return (
            'wss://fstream.binance.com/stream?streams=' +
            this.pair +
            '@trade/' +
            this.pair +
            '@forceOrder'
          )
        }
      },
      this.options
    )
  }

  connect(pair) {
    if (!super.connect(pair)) return

    this.api = new WebSocket(this.getUrl())

    this.api.on('message', event => this.emitData(this.format(event)))

    this.api.on('open', this.emitOpen.bind(this))

    this.api.on('close', this.emitClose.bind(this))

    this.api.on('error', this.emitError.bind(this))
  }

  disconnect() {
    if (!super.disconnect()) return

    if (this.api && this.api.readyState < 2) {
      this.api.close()
    }
  }

  format(event) {
    const trade = JSON.parse(event)

    if (trade && trade.data) {
      if (trade.data.e === 'trade' && trade.data.X !== 'INSURANCE_FUND') {
        return [[this.id, trade.data.T, +trade.data.p, +trade.data.q, trade.data.m ? 0 : 1]]
      } else if (trade.data.e === 'forceOrder') {
        return [
          [
            this.id,
            trade.data.o.T,
            +trade.data.o.p,
            +trade.data.o.q,
            trade.data.o.S === 'BUY' ? 1 : 0,
            1
          ]
        ]
      }
    }

    return false
  }
}

module.exports = BinanceFutures
