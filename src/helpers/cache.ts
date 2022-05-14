/* const mcache = require('memory-cache');

export const cache = (duration:number) => {
    return(req:any, res:any, next:any) => {
        let key = req.originalUrl
        let cachedBody = mcache.get(key)
        if(cachedBody) {
            res.send(cachedBody)
            return;
        } else {
            res.sendResponse = res.send
            res.send = (body:any) => {
                mcache.put(key, body, duration * 1000);
                res.sendResponse(body)
            }
            next()
        }
    }
}; */

/* const getExpeditiousCache = require('express-expeditious');

export const cache = (time: number) => {

    const expressCache = getExpeditiousCache({
        namespace: 'expresscache',
        defaultTtl: (time * 1000),
        objectMode: true,
        statusCodeExpires: {
            404: '5 minutes',
            500: 0
        },
        engine: require('expeditious-engine-redis')(
            {
                host: '127.0.0.1',
                port: 6379
            }
        )
    });

    return expressCache;

};
 */