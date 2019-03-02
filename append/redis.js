const cacheBase = require('./cacheBase');
const redis = require('redis');
const url = require('url');
const {isFunction, noop} = require('../../stateMachine');


class RedisCache extends cacheBase {
    constructor(redisURL) {
        super();
        this.redisClient = this.setupRedis(redisURL);
    }

    setupRedis({redisUrl = 'redis://127.0.0.1:6379', onError = noop}) {
        const redisConfig = url.parse(redisUrl);
        const redisClient = redis.createClient(redisConfig.port, redisConfig.hostname);
        const db = redisConfig.path && redisConfig.path.substr(1);
        const redisDB = +db || 0;
        redisClient.select(redisDB);
        redisClient.on('error', onError);
        return redisClient;
    }

    get(name, callback = noop) {
        this.redisClient.hgetall(name, callback);
    }

    set(name, value, expire, callback = noop) {
        if (isFunction(expire)) {
            expire = -1;
            callback = expire;
        }
        this.redisClient.hmset(name, value, (err) => {
            if (err || +expire <= 0) {
                return callback(err);
            }
            this.redisClient.expire(name, +expire, callback);
        });
    }

    del(name, callback = noop) {
        this.redisClient.del(name, callback);
    }
}

module.exports = RedisCache;
