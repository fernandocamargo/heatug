const { createHash } = require('crypto');

class Hash {
  constructor(filename) {
    const hash = '_'.concat(createHash('md5').update(filename).digest('hex'));

    this.forwardRef = hash.concat('forwardRef');
    this.Root = hash.concat('Root');
  }
}

module.exports = { Hash };
