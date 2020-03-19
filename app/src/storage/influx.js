const Influx = require('influx')
const getHms = require('../helper').getHms

class InfluxStorage {
  constructor(options) {
    this.format = 'tick'

    if (!options.influxUrl) {
      throw `Please set the influxdb url using influxURL property in config.json`
    }

    this.options = options
  }

  connect() {
    console.log(`[storage/influx] connecting`)

    return new Promise((resolve, reject) => {
      try {
        this.influx = new Influx.InfluxDB({
          host: this.options.influxUrl,
          database: 'significant_trades'
        })

        this.influx
          .getDatabaseNames()
          .then(names => {
            if (!names.includes('significant_trades')) {
              return this.influx.createDatabase('significant_trades')
            }
          })
          .then(() => {
            resolve()
          })
          .catch(err => {
            console.error(`[storage/influx] error creating Influx database :-(`)

            reject(err)
          })
      } catch (error) {
        throw error
      }
    })
  }

  save(chunk) {
    if (!chunk || !chunk.length) {
      return Promise.resolve()
    }

    const data = {
      trades: [],
      liquidations: []
    }

    for (let i = 0; i < chunk.length; i++) {
      const trade = chunk[i]
      const fields = {
        price: +trade[2],
        side: trade[4] > 0 ? true : false
      }

      if (trade[4] > 0) {
        fields.buy = +trade[3]
      }

      if (trade[4] < 1) {
        fields.sell = +trade[3]
      }

      const point = {
        tags: {
          exchange: trade[0],
          pair: this.options.pair
        },
        fields: fields,
        timestamp: parseInt(trade[1])
      }

      if (trade[5] == 1) {
        data.liquidations.push(point)
      } else {
        data.trades.push(point)
      }
    }

    const promises = []

    for (let type in data) {
      if (!data[type].length) {
        continue
      }

      promises.push(this.influx.writeMeasurement(type, data[type]))
    }

    return Promise.all(promises).catch(err => {
      console.error(`[storage/influx] error saving data to InfluxDB\n${err.stack}`)
    })
  }

  fetch(from, to, timeframe = 1000 * 60) {
    return this.influx
      .query(
        `
			SELECT
				first(price) AS open,
				last(price) AS close,
				max(price) AS high,
				min(price) AS low,
				sum(buy) + sum(sell) AS volume,
				sum(buy) * median(price) as buys,
				sum(sell) * median(price) as sells,
				count(side) as records
			FROM trades 
			WHERE pair='${this.options.pair}' AND time > ${from}ms and time < ${to}ms 
			GROUP BY time(${timeframe}ms), exchange fill(none)
		`
      )
      .then(ticks =>
        ticks
          .map(tick => {
            tick.timestamp = +new Date(tick.time)

            delete tick.time

            return tick
          })
          .sort((a, b) => a.timestamp - b.timestamp)
      )
      .catch(error => {
        console.error(
          `[storage/influx] failed to retrieves trades between ${from} and ${to} with timeframe ${timeframe}\n\t`,
          error.message
        )
      })
  }
}

module.exports = InfluxStorage
