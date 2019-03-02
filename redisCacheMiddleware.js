const loadAppends = require('./appenderLoad');
const {responseAndCacheFactory, responseFromCache} = require('./responseFactory');
const race = require('./race');
const DEFAULT_EXPIRE = 3600;


const defaultKeyGenerate = (req) => req.originalUrl || req.url;
const defaultCacheDisable = (req) => !!req.cacheEnable;

const defaultShouldCache = (req, res, next) => {
    const statusCode = res.statusCode;
    if (statusCode >= 200 && statusCode < 400) {
        return true;
    }
    return false;
};

const getFromFaster = (appenders, key, callback) => race(appenders, (appender, cb) => appender.get(key, cb), callback);

const cacheMiddlewareFactory = (configList) => {
    const appenders = loadAppends(configList);
    return (expire = DEFAULT_EXPIRE, {
        cacheKeyGen = defaultKeyGenerate,
        cacheDisable = defaultCacheDisable,
        shouldCache = defaultShouldCache
    } = {}) => (req, res, next) => {
        if (cacheDisable.call(req, req, res, next)) {
            return next();
        }
        const key = cacheKeyGen.call(req, req, res, next);
        getFromFaster(appenders, key, (err, cache) => {
            if (err) {
                return next();
            } else if (!cache) {
                return responseAndCacheFactory(expire, shouldCache, (cacheObj) => {
                    for (const appender of appenders) {
                        appender.set(key, cacheObj, expire);
                    }
                })(req, res, next);
            }
            return responseFromCache(cache, res);
        });
    };
};

module.exports = {
    cacheMiddlewareFactory,
    defaultKeyGenerate,
    defaultShouldCache,
    defaultCacheDisable
};

