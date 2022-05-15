const redis = require("redis");
require('dotenv').config()

const client = redis.createClient(process.env.REDISCLOUD_URL);

(async function () {

    client.on('error', (err: Error) => console.log('Redis Client Error', err));

    await client.connect();

})();


export const getCache = async (key: string) => {

    const reply: any = await client.get(key);

    return JSON.parse(reply);

};

export const setCache = async (key: string, data: any) => {

    await client.set(key, JSON.stringify(data),
        {
            EX: 60
        });


};