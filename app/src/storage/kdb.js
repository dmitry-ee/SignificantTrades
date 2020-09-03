const nodeq = require("node-q");

class KdbStorage {
  constructor(options) {
		if (!options.kdbUrl) {
			throw `Please set the kdb host:port using kdbUrl property in config.json`;
		}
		// this.pattern = '<trades-{now/d}>';
    this.options = options;
    this.kdbHost = options.kdbUrl.split(':')[0]
    this.kdbPort = parseInt(options.kdbUrl.split(':')[1])
    this.kdb = null
    this.tradesStored = 0
    this.tradesSkipped = 0
    this.kdbStoreAnnouncementEvery = this.options.kdbStoreAnnouncementEvery

    // table mapping
    this.typeMapping = {
      trades: {
        time:     nodeq.timespans,
        sym:      nodeq.symbols,
        exchange: nodeq.symbols,
        price:    nodeq.floats,
        size:     nodeq.floats,
        side:     nodeq.chars,
        liq:      nodeq.booleans,
      }
    }
  }
  
  flipArray(arrayOfObj) {
    return Object.assign(...Object.keys(arrayOfObj[0]).map( key =>
      ({ [key]: arrayOfObj.map( o => o[key] ) })
    ))
  }

	connect() {
    console.log(`[storage/kdb] connecting`);
    let self = this;

    setInterval(() => {
      console.log(`[storage/kdb] ${self.tradesStored}/${self.tradesSkipped} trades saved/skipped`)
      self.tradesStored = 0
      self.tradesSkipped = 0
    }, self.kdbStoreAnnouncementEvery)

		return new Promise((resolve, reject) => {
			try {
        // console.log('connect()')
        nodeq.connect({ host: this.kdbHost, port: this.kdbPort }, function(err, kdb) {
          if (err) throw err;
          console.log(`[storage/kdb] connected to ${self.kdbHost}:${self.kdbPort}`);
          self.kdb = kdb

          // kdb.ks(`${self.options.kdbTable}:([]date:\`date$();time:\`time$();exchange:\`symbol$();pair:\`symbol$();price:\`float$();size:\`float$();side:\`char$();liq:\`boolean$())`, err => {
          console.log(`[storage/kdb] using table ${self.options.kdbTable}`)
          console.log(`[storage/kdb] to be sure that everything works fine, i'll announce kdb writes every ${Math.round(self.kdbStoreAnnouncementEvery/1000)} sec`)
            // if (err) throw(err)
          // })
        });
        resolve()
      } catch (error) {
        throw error;
        reject(error)
			}
    })
  }

  formatTradeForKdbUpd(trade) {
    return {
      time: new Date(trade[1]),
      sym:  this.options.pair,
      exchange: trade[0],
      price: trade[2],
      size: trade[3],
      side: trade[4] == 1 ? "L" : "S",
      liq: trade[5] != null,
    }
  }

  flipAndFormatTradesForKdbUpd(trades) {
    const formattedTrades = trades.map(x => this.formatTradeForKdbUpd(x))
    const flippedTrades = this.flipArray(formattedTrades)
    const res = []
    // return flippedTrades
    for (let k of Object.keys(flippedTrades)) {
      const mappingFn = this.typeMapping["trades"][k]
      res.push(mappingFn ? mappingFn(flippedTrades[k]) : flippedTrades[k])
    }
    return res
  }

  save(chunk) {
    let self = this;

    const tradesBefore = chunk.length
    chunk = chunk.filter(trade => (trade[3]*trade[2]) > self.options.minAmount)

		if (!chunk || !chunk.length || chunk.length == 0) {
			return Promise.resolve()
    }
    
    return new Promise((resolve, reject) => {
      const flippedAndFormattedTrades = self.flipAndFormatTradesForKdbUpd(chunk)

      self.kdb.k('.u.upd', nodeq.symbol(self.options.kdbTable), flippedAndFormattedTrades, (err) => {
        if (err) {
          console.error(`[storage/kdb] ${err} ${err.stack}\n`)
          reject(err)
        } else {
          self.tradesStored += chunk.length
          self.tradesSkipped += (tradesBefore - chunk.length)
        }
      })
      resolve()
    })
	}
}

module.exports = KdbStorage