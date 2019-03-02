function createCacheObject(status, headers, data, cacheExpire, type) {
    return {
        status,
        headers,
        data,
        type,
        cacheCreateAt: Math.round(new Date().getTime() / 1000),
        cacheExpire
    };
}

function convertToString(content) {
    if (typeof(content) === 'string') {
        return ['string', content];
    } else if (Buffer.isBuffer(content)) {
        return ['buffer', content.toString()];
    }
    return ['object', JSON.stringify(content)];
}

function revertBackFromString(type, string) {
    if ('string' === type) {
        return string;
    } else if ('buffer' === type) {
        return new Buffer(string);
    }
    return JSON.parse(string);
}

function responseAndCacheFactory(expire, shouldCache, callback) {
    return function(req, res, next) {
        const end = res.end.bind(res);
        res.end = function(content, encoding) {
            end.apply(null, [content, encoding]);
            if (!shouldCache.call(req, req, res, next)) {
                return;
            }
            const headers = this._headers;
            const [type, content2String] = convertToString(content);
            if (!content2String) {
                return;
            }
            const [, headers2String] = convertToString(headers);
            const cacheObject = createCacheObject(res.statusCode, headers2String, content2String, expire, type);
            callback.call(null, cacheObject);
        };
        next();
    };
}

function responseFromCache(cache, res) {
    const {status, headers, data, cacheCreateAt, cacheExpire, type} = cache;
    res.set(Object.assign(revertBackFromString(undefined, headers), {cacheCreateAt, cacheExpire, 'content-encoding': null}));
    const content = revertBackFromString(type, data);
    return res.send(status, content);
}

module.exports = {
    responseAndCacheFactory,
    responseFromCache
};

