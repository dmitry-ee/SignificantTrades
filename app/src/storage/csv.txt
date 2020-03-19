const fs = require('fs');

class CSVStorage {

	constructor(options) {
		this.options = options;
		this.format = 'trade';

		if (!fs.existsSync('./data')){
			fs.mkdirSync('./data');
    }

    this.stream = fs.createWriteStream('./data/save.csv', {flags: 'a'})
  }

	save(chunk) {
		if (!chunk || !chunk.length) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			if (!chunk.length) {
				return resolve(true);
      }

      const lines = chunk.map(a => {
        const iso = new Date(a[1]).toISOString().match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/)

        return [
          iso[1] + ' ' + iso[2],
          a[3],
          a[4] > 0 ? 'buy' : 'sell',
          'id to generate?',
        ].join(`,`)
      }).join(`\r\n`)

      this.stream.write(`${lines}\r\n`, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve(true)
        }
      })
		});
	}

	fetch(from, to, timeframe) {
	}

}

module.exports = CSVStorage;