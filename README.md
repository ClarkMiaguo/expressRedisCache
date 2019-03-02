usage:
const {cacheMiddlewareFactory} = require('./redisCacheMiddleware')
const cache = cacheMiddlewareFactory();
router.get('/...', cache(), normalRouter)


still draft now...
