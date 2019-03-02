const EventEmitter = require('events');

class cacheBase extends EventEmitter {
    get() {
        throw Error('must implement in child');
    }

    set() {
        throw Error('must implement in child');
    }

    del() {
        throw Error('must implement in child');
    }
}

module.exports = cacheBase;
