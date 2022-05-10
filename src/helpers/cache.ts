const mcache = require('memory-cache');

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
};