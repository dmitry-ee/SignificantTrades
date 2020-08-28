const Exchange = require('../exchange')
const WebSocket = require('ws')

class Ftx extends Exchange {
  constructor(options) {
    super(options)

    this.id = 'ftx'

    this.endpoints = {
      PRODUCTS: 'https://ftx.com/api/markets'
    }

    this.mapping = {
      ADAUSD: 'ADA-PERP',
      ALGOUSD: 'ALGO-PERP',
      ALTUSD: 'ALT-PERP',
      ATOMUSD: 'ATOM-PERP',
      BCHUSD: 'BCH-PERP',
      BNBUSD: 'BNB-PERP',
      BSVUSD: 'BSV-PERP',
      BTCUSD: 'BTC-PERP',
      BTMXUSD: 'BTMX-PERP',
      DOGEUSD: 'DOGE-PERP',
      DRGNUSD: 'DRGN-PERP',
      EOSUSD: 'EOS-PERP',
      ETCUSD: 'ETC-PERP',
      ETHUSD: 'ETH-PERP',
      EXCHUSD: 'EXCH-PERP',
      HTUSD: 'HT-PERP',
      LEOUSD: 'LEO-PERP',
      LINKUSD: 'LINK-PERP',
      LTCUSD: 'LTC-PERP',
      MATICUSD: 'MATIC-PERP',
      MIDUSD: 'MID-PERP',
      OKBUSD: 'OKB-PERP',
      PAXGUSD: 'PAXG-PERP',
      BERNIE: 'BERNIE',
      BIDEN: 'BIDEN',
      BLOOMBERG: 'BLOOMBERG',
      PETE: 'PETE',
      TRUMP: 'TRUMP',
      WARREN: 'WARREN',
      PRIVUSD: 'PRIV-PERP',
      SHITUSD: 'SHIT-PERP',
      TOMOUSD: 'TOMO-PERP',
      TRXUSD: 'TRX-PERP',
      TRYBUSD: 'TRYB-PERP',
      USDTUSD: 'USDT-PERP',
      XRPUSD: 'XRP-PERP',
      XTZUSD: 'XTZ-PERP'
    }

    this.options = Object.assign(
      {
        url: () => {
          return `wss://ftx.com/ws/`
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
      this.skip = true

      this.api.send(JSON.stringify({ op: 'subscribe', channel: 'trades', market: this.pair }))

      this.keepalive = setInterval(() => {
        this.api.send(
          JSON.stringify({
            op: 'ping'
          })
        )
      }, 15000)

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
    if (!json || !json.data || !json.data.length) {
      return
    }

    return json.data.map(trade => {
      const output = [
        this.id,
        +new Date(trade.time),
        +trade.price,
        trade.size,
        trade.side === 'buy' ? 1 : 0
      ]

      if (trade.liquidation) {
        output[5] = 1
      }

      return output
    })
  }
}

module.exports = Ftx
