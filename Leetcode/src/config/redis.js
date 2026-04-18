// const {createClient}=require('redis')

// const redisClient = createClient({
//     username: 'default',
//     password: 'QmaCC9dG6QtrxxXy0WEBV5hg2HYm4Q7S',
//     socket: {
//         host: 'redis-12659.c301.ap-south-1-1.ec2.cloud.redislabs.com',
//         port: 12659
//     }
// });
// const connectRedis= async()=>{
//     await redisClient.connect();
//     console.log("connect redis")
// }
// connectRedis();

// module.exports=redisClient;

const {createClient}=require('redis')

const redisClient = createClient({
    username: 'default',
    password: 'ArrTCMkFiKCbxPnKNE85bHIXf3Mib6Et',
    socket: {
        host: 'redis-14892.c285.us-west-2-2.ec2.cloud.redislabs.com',
        port: 14892
    }
});

const connectRedis= async()=>{
    await redisClient.connect();
    console.log("connect redis")
}

connectRedis();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar

module.exports=redisClient;