const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });
const jwt = require('jsonwebtoken');
const axios = require('axios');

const verifyAndDecode = (auth) => {
    const bearerPrefix = 'Bearer ';
    if (!auth.startsWith(bearerPrefix)) return { err: 'Invalid authorization header' };
    try {
      const token = auth.substring(bearerPrefix.length);
      const secret = process.env.secret;
      return jwt.verify(token, Buffer.from(secret, 'base64'), { algorithms: ['HS256'] });
    } catch (err) {
      return { err: 'Invalid JWT' };
    }
};
const makeServerToken = channelID => {
    const serverTokenDurationSec = 30;
  
    const payload = {
      exp: Math.floor(Date.now() / 1000) + serverTokenDurationSec,
      channel_id: channelID,
      user_id: process.env.ownerId,
      role: 'external',
      pubsub_perms: {
        send: ["broadcast"],
      },
    };
    
    const secret = Buffer.from(process.env.secret, 'base64');
    return jwt.sign(payload, secret, { algorithm: 'HS256' });
};

const storeDB = async (channelId, poster, post,unique) => {
    console.log("STORE DB START")
    const newEntry = {
        TableName: 'upvote-db',
        Item: {
            channel: channelId,
            uid: unique,
            time: Date.now(),
            poster: poster,
            post: post,
            upvotes: 0
        }
    };
    return await documentClient.put(newEntry).promise();
};

exports.handler = async (event) => {
    const response = (statusCode, body) => {
        const headers = {
            ['Access-Control-Allow-Origin']: event.headers.origin,
            ["Access-Control-Allow-Credentials"] : true
        };
        return { statusCode, body: JSON.stringify(body, null, 2), headers };
    };
    console.log(event);
    const payload = verifyAndDecode(event.headers.Authorization);
    const channelId = payload.channel_id;
    var data = event['body'];
    console.log("DATA", data);
    return response(200, 'success');
}