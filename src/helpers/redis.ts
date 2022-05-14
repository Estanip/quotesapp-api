import { createClient } from 'redis';

const client = createClient();

(async function () {

    client.on('error', (err) => console.log('Redis Client Error', err));
    
    await client.connect();

})();


export const getCache = async (key:string) => {

    const reply:any = await client.get(key);
    
    return JSON.parse(reply);

};

export const setCache = async (key:string, data:any) => {

    await client.set(key, JSON.stringify(data), 
    {
        EX: 60
    });
    

};