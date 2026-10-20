const util = require('util');

if (typeof util.isError !== 'function') {
  util.isError = util.types && typeof util.types.isNativeError === 'function'
    ? util.types.isNativeError
    : (value) => value instanceof Error || (value && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Error]');
}

process.argv = ['node', 'ng'].concat(process.argv.slice(2));
require('@angular/cli/bin/ng');
