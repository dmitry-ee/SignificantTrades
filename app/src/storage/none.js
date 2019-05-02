class NoopStorage {
	constructor(options) {
		this.options = options;
	}
  save(chunk){ }
  fetch(from, to){ return [] }
}

module.exports = NoopStorage;
