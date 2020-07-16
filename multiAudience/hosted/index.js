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
const initialDB = async () => {
    console.log("initial DB start")
    const params = {
        TableName: 'audience-data',
        Key:{
            "flag": "tallys"
        }
    };
    return await documentClient.get(params).promise();
}

const tallyDB = async (tally1,tally2,tally3,tally4) => {
    console.log("Tally DB START")
    const params = {
        TableName: 'audience-data',
        Key:{
            "flag": "tallys"
        },
        // UpdateExpression: "ADD tally1 :a, tally2 :b",
        UpdateExpression: "ADD tally1 :a, tally2 :b, tally3 :c, tally4 :d, #tallycount :e",
        ExpressionAttributeNames:{
            "#tallycount": "count"
        },
        ExpressionAttributeValues:{
            ":a":tally1,
            ":b":tally2,
            ":c":tally3,
            ":d":tally4,
            ":e":1
        },
        ReturnValues:"ALL_NEW"
    };
    return await documentClient.update(params).promise();
};
const configDB = async (config1,config2,config3,config4) => {
    console.log("Config DB START")
    const params = {
        TableName: 'audience-data',
        Key:{
            "flag": "tallys"
        },
        UpdateExpression: "SET config1 =:a, config2 =:b, config3 =:c, config4 =:d",
        ExpressionAttributeValues:{
            ":a":config1,
            ":b":config2,
            ":c":config3,
            ":d":config4
        },
        ReturnValues:"ALL_NEW"
    };
    return await documentClient.update(params).promise();
};
const resetDB = async() =>{
    console.log("RESET DB START")
    const params = {
        TableName: 'audience-data',
        Key:{
            "flag": "tallys"
        },
        UpdateExpression: "SET tally1 =:a, tally2 =:a, tally3 =:a, tally4 =:a, #tallycount =:a",
        ExpressionAttributeNames:{
            "#tallycount": "count"
        },
        ExpressionAttributeValues:{
            ":a":0
        },
        ReturnValues:"NONE"
    };
    return await documentClient.update(params).promise();
}

const sendBroadcast = async (channel, data) =>{
    const link = `https://api.twitch.tv/extensions/message/` + channel
    const bearerPrefix = 'Bearer ';
    const request = {
        method: 'POST',
        url: link,
        headers : {
            'Client-ID': process.env.clientId,
            'Content-Type': 'application/json',
            'Authorization': bearerPrefix + makeServerToken(channel),
        },
        data : JSON.stringify({
          content_type: 'application/json',
          message: data,
          targets: ['broadcast']
        })
    }
    return await axios(request)
}


const audienceHandler = async(data, event) =>{
    if(data["signifier"] == "tally"){
        let updatedTally = await tallyDB(data["tally1"],data["tally2"],data["tally3"],data["tally4"]);
        updatedTally = updatedTally["Attributes"];
        console.log("new tally data = ", updatedTally);
        if(updatedTally['count']%1 == 0){
            console.log("sending pubsub")
            const payload = verifyAndDecode(event.headers.Authorization);
            const channelId = payload.channel_id;
            var message = {
                data:{
                    tally1:updatedTally['tally1'],
                    tally2:updatedTally['tally2'],
                    tally3:updatedTally['tally3'],
                    tally4:updatedTally['tally4'],
                    identifier:'newTally'
                }
            }
            await sendBroadcast(channelId, JSON.stringify(message))
        }else{
            console.log("no pubsub yet", updatedTally['count'])
        }
    }else if(data["signifier"] == "config-update"){
        const payload = verifyAndDecode(event.headers.Authorization);
        const channelId = payload.channel_id;
        var message = {
            data:{
              config1:data[1],
              config2:data[2],
              config3:data[3],
              config4:data[4],
              identifier:'newConfig'
            }
        }
        let [newConfig, broadcastResult] = await Promise.all([configDB(data[1],data[2],data[3],data[4]),sendBroadcast(channelId, JSON.stringify(message))]);
        console.log("NEW CONFIG-", newConfig)
    }else if(data["signifier"] == 'initial'){
        console.log("INITIAL")
        let dbResult = await initialDB()
        dbResult = dbResult["Item"]
        message = {
            1:dbResult["tally1"],
            2:dbResult["tally2"],
            3:dbResult["tally3"],
            4:dbResult["tally4"],
            "identifier": "initial"
        }
        return message
    }else if(data["signifier"] == 'reset'){
        await resetDB()
    }
    
    return false
}

exports.handler = async (event) => {
    const response = (statusCode, body) => {
        const headers = {
            // ['Access-Control-Allow-Origin']: event.headers.origin,
            ['Access-Control-Allow-Origin']: '*',
            ["Access-Control-Allow-Credentials"] : true
        };
        return { statusCode, body: JSON.stringify(body, null, 2), headers };
    };
    console.log(event);
    // const payload = verifyAndDecode(event.headers.Authorization);
    // const channelId = payload.channel_id;
    var data = event['body'];
    console.log("DATA", data);
    data = JSON.parse(data)
    // console.log('d',data["signifier"])
    let x = await audienceHandler(data,event)
    if(x){
        return response(200, JSON.stringify(x));
    }else{
        return response(200, 'success');
    }
}