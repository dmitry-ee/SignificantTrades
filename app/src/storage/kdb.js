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
	}

	connect() {
    console.log(`[storage/kdb] connecting`);
    let self = this;

		return new Promise((resolve, reject) => {
			try {
        // console.log('connect()')
        nodeq.connect({ host: this.kdbHost, port: this.kdbPort }, function(err, kdb) {
          if (err) throw err;
          console.log(`[storage/kdb] connected to ${self.kdbHost}:${self.kdbPort}`);
          self.kdb = kdb

          kdb.ks(`${self.options.kdbTable}:([]date:\`datetime$();exchange:\`symbol$();pair:\`symbol$();price:\`float$();size:\`float$();side:\`symbol$();liq:\`boolean$())`, err => {
            console.log('[storage/kdb] table `trades created')
            if (err) throw(err)
          })
        });
        resolve()
      } catch (error) {
        throw error;
        reject(error)
			}
    })
  }

  formatTradeForKdb(trade) {
          
    return {
      date: new Date(trade[1]), 
      exchange: `\`${trade[0]}`, 
      // "exchange": trade[0],
      pair: `\`${this.options.pair}`, 
      // "pair": this.options.pair,
      price: trade[2], 
      size: trade[3], 
      side: trade[4] == 1 ? "`long" : "`short", 
      // "side": trade[4] == 1 ? "long" : "short",
      liq: trade[5] != null
    }
    // return [
    //   nodeq.timestamp(new Date(trade[1])),
    //   `\`${trade[0]}`,
    //   `\`${this.options.pair}`,
    //   trade[2],
    //   trade[3],
    //   trade[4] == 1 ? "`long" : "`short",
    //   trade[5] == null ? 0 : 1,
    // ]
  }

  save(chunk) {
    let self = this;

		if (!chunk || !chunk.length) {
			return Promise.resolve();
		}

    const trades = [];

    for (let c of chunk) {
      trades.push(this.formatTradeForKdb(c))
    }
    
    return new Promise((resolve, reject) => {
      // const q = `\`trades insert (${JSON.stringify(trades[0])})`
      self.kdb.k(`\`${self.options.kdbTable} insert`, trades, (err) => {
        if (err) {
          console.error(`[storage/kdb] ${err} ${err.stack}\n`)
          reject(err)
        } else {
          console.log(`[storage/kdb] ${trades.length} trades writed`)
        }
      })
      resolve()
    })
	}
}

module.exports = KdbStorage