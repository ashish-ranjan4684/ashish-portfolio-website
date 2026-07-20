const {createClient} = require("redis");

const client = createClient({
    socket:{
        host:process.env.REDIS_HOST,
        port:process.env.REDIS_PORT
    },
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD
});

const clientPromise = client.connect();

module.exports = {
    client,
    clientPromise
}