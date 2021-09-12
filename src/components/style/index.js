const statics = require('./statics');
const { default: render } = require('./render');

module.exports = Object.assign(render, statics);
