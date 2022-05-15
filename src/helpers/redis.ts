const redis = require("redis");
require('dotenv').config()

const client = redis.createClient({
    url: 'rediss://:p3a948e7241f940905a05d581f1b87b5068695785e512dddcbf3578339677d6ac@ec2-34-196-217-231.compute-1.amazonaws.com:23560',
    socket: {
      tls: true,
      rejectUnauthorized: false
    }
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