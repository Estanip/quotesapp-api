const redis = require("redis");
const url = require('url');
require('dotenv').config()

var redisURL = url.parse('redis://:p3a948e7241f940905a05d581f1b87b5068695785e512dddcbf3578339677d6ac@ec2-34-196-217-231.compute-1.amazonaws.com:23559');

const redisConfig = {
    host: process.env.REDIS_HOST_PROD,
    port: process.env.REDIS_PORT_PROD,
    password: process.env.REDIS_PASS_PROD
};

const client = redis.createClient({
    port: process.env.REDIS_PORT_PROD,
    host: process.env.REDIS_HOST_PROD,
    password: process.env.REDIS_PASSWORD,
    tls: {
        rejectUnauthorized: false,
    },
    no_ready_check: true
});

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