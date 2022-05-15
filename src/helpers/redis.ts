const redis = require("redis");
require('dotenv').config()

const client = redis.createClient({url: process.env.REDISCLOUD_URL});

(async function () {

    console.log(process.env.REDISCLOUD_URL)
    console.log(typeof(process.env.REDISCLOUD_URL))


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