const { createHash } = require('crypto');

class Meta {
  constructor({ filename }) {
    const hash = '_'.concat(createHash('md5').update(filename).digest('hex'));

    this.identifiers = {
      Root: hash.concat('Root'),
      forwardRef: hash.concat('forwardRef'),
    };
  }
}

module.exports = { Meta };
