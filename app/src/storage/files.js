const fs = require('fs');

class FilesStorage {

	constructor(options) {
		this.options = options;
		this.format = 'trade';

		/** @type {{[timestamp: string]: {stream: fs.WriteStream, updatedAt: number}}} */
		this.writableStreams = {};
		
		/** @type {[string, number, number, number, number][]} */
		this.cache = []; // last file data

		if (!this.options.filesInterval) {
			this.options.filesInterval = 3600000; // 1h file default
		}

		if (!fs.existsSync('./data')){
			fs.mkdirSync('./data');
		}
	}

	/**
	 * Construit le nom du fichier a partir d'une date
	 * BTCUSD_2018-12-01-22
	 *
	 * @param {Date} date
	 * @returns {string}
	 * @memberof FilesStorage
	 */
	getBackupFilename(date) {
		let filename = `
			${this.options.filesLocation}/${this.options.pair}
			_${date.getFullYear()}
			-${('0' + (date.getMonth()+1)).slice(-2)}
			-${('0' + date.getDate()).slice(-2)}
		`;

		if (this.options.filesInterval < 1000 * 60 * 60 * 24) {
			filename += `-${('0' + date.getHours()).slice(-2)}`;
		}

		if (this.options.filesInterval < 1000 * 60 * 60) {
			filename += `-${('0' + date.getMinutes()).slice(-2)}`;
		}

		if (this.options.filesInterval < 1000 * 60) {
			filename += `-${('0' + date.getSeconds()).slice(-2)}`;
		}

		return filename.replace(/\s+/g, '');
	}

	addWritableStream(ts) {
		const name = this.getBackupFilename(new Date(+ts));

    this.writableStreams[ts] = {
			updatedAt: null,
			stream: fs.createWriteStream(name, { flags: 'a' })
		}

		console.log(`[storage/files] created writable stream ${new Date(+ts).toUTCString()} => ${name}`);
	}

	reviewStreams() {
		const now = +new Date();

		for (let ts in this.writableStreams) {
			if (now - this.writableStreams[ts].updatedAt > 1000 * 60 * 10) {
				this.writableStreams[ts].stream.end();
				delete this.writableStreams[ts];

				console.log(`[storage/files] closed stream ${new Date(+ts).toUTCString()}`);
			}
		}
	}

	reviewCache() {
		if (!this.options.api) {
			return;
		}
		
		const now = +new Date();
		const threshold = now - this.options.filesInterval;
		let i;

		for (i = 0; i < this.cache.length; i++) {
			if (this.cache[i][1] > threshold) {
				break;
			}
		}

		if (i) {
			this.cache.splice(0, i);
		}
	}

	save(chunk) {
		const now = +new Date();

		const output = {};

		return new Promise((resolve, reject) => {
			if (!chunk.length) {
				return resolve(true);
			}

			for (let i = 0; i < chunk.length; i++) {
				const ts = Math.floor(chunk[i][1] / this.options.filesInterval) * this.options.filesInterval;

				if (!output[ts]) {
					output[ts] = '';
				}

				output[ts] += chunk[i].join(' ') + '\n';
			}

			if (this.options.api) {
				this.cache = this.cache.concat(chunk.splice(0, chunk.length));
			}

			const promises = [];


			for (let ts in output) {
				if (!this.writableStreams[ts]) {
					this.addWritableStream(ts);
				}

				promises.push(new Promise((resolve) => {
					this.writableStreams[ts].stream.write(output[ts], err => {
						if (err) {
							console.log(`[storage/files] stream.write encountered an error\n\t${err}`);
						} else {
							console.log(`[storage/files] stream.write success ${new Date(+ts).toUTCString()}`);
							this.writableStreams[ts].updatedAt = now;
						}

						resolve();
					});
				}))
			}

			Promise.all(promises).then(() => resolve());
		}).then(success => {
			this.reviewStreams();
			this.reviewCache();

			return success;
		})
	}

	fetch(from, to, timeframe) {
		if (this.cache.length && from >= this.cache[0][1]) {
			console.log(`[storage/files] fetch using cache (${new Date(from).toUTCString()} to ${new Date(to).toUTCString()})`)

			let fromIndex;
			let toIndex = this.cache.length - 1;

			for (let i = 0; i < this.cache.length; i++) {
				if (typeof fromIndex === 'undefined' && from <= this.cache[i][1]) {
					fromIndex = i;
				}

				if (this.cache[i][1] > to) {
					toIndex = i - 1;
					break;
				}
			}

			console.log(`\tfromIndex: ${fromIndex}\n\ttoIndex: ${toIndex}\n\tcacheLength: ${this.cache.length}`);

			return Promise.resolve(this.cache.slice(fromIndex, toIndex));
		}

		const paths = [];

		for (let i = Math.floor(from / this.options.filesInterval) * this.options.filesInterval; i <= to; i += this.options.filesInterval) {
			paths.push(this.getBackupFilename(new Date(i)));
		}

		if (!paths.length) {
			return Promise.resolve([]);
		}



		return Promise.all(paths.map(path => {
			return new Promise((resolve, reject) => {
				fs.readFile(path, 'utf8', (error, data) => {
					if (error) {
						// console.error(`[storage/files] unable to get ${path}\n\t`, error.message);
						return resolve([]);
					}

					data = data.trim().split("\n");

					if (data[0].split(' ')[1] >= from && data[data.length - 1].split(' ')[1] <= to) {
						return resolve(data.map(row => row.split(' ')));
					} else {
						const chunk = [];

						for (let j = 0; j < data.length; j++) {
							const trade = data[j].split(' ');

							if (trade[1] <= from || trade[1] >= to) {
								continue;
							}

							chunk.push(trade);
						}

						return resolve(chunk);
					}
				})
			});
		})).then(chunks => [].concat.apply([], chunks));
	}

}

module.exports = FilesStorage;