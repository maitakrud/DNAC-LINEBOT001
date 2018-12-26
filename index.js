'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const config = require('./config.json');

// create LINE SDK client
const client = new line.Client(config);

const app = express();

// webhook callback
app.post('/webhook', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  // handle events separately
  Promise.all(req.body.events.map(event => {
    console.log('event', event);
    // check verify webhook event
    if (event.replyToken !== '' ) {
      return handleEvent(event);
    }
    return handleEvent(event);
  }))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// simple reply function
const replyText = (token, message) => {
  message = Array.isArray(message) ? message : [message];
  return client.replyMessage(
    token,
    message.map((text) => ({ type: 'text', text }))
  );
};

// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      const inputCommand = message.text.split(' ');

      let helpMessage = {
        type: 'text',
        id: message.id,
        text: ''
      };

      switch (message.type) {
        case 'text':
          if(inputCommand[0] == 'help'){

            helpMessage.text = 'This line bot function have \n - get device by ip , command = get device ip "ip address" \n - get device by serial number , command = get device sn "Serial Number"'

            return handleText(event.replyToken, helpMessage);

          }else if (inputCommand[0] == 'get' && inputCommand[1] == 'device' && inputCommand[2] == 'ip') {
            if(inputCommand.length == 4){

              helpMessage.text = 'IP Address'

            }else{

              helpMessage.text = 'Invalid command format.'

            }

            return handleText(event.replyToken, helpMessage);

          }else if (inputCommand[0] == 'get' && inputCommand[1] == 'device' && inputCommand[2] == 'sn') {
            if(inputCommand.length == 4){

              helpMessage.text = 'SN'

            }else{

              helpMessage.text = 'Invalid command format.'

            }

            return handleText(event.replyToken, helpMessage);

          } else {

            message.text = 'Please use "help" to show how to use this bot'

            return handleText(event.replyToken, message);
          }
          return handleText(event.replyToken, message);
        case 'image':
          return handleImage(event.replyToken, message);
        case 'video':
          return handleVideo(event.replyToken, message);
        case 'audio':
          return handleAudio(event.replyToken, message);
        case 'location':
          return handleLocation(event.replyToken, message);
        case 'sticker':
          return handleSticker(event.replyToken, message);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`;
      return replyText(event.replyToken, `${event.beacon.type} beacon hwid : ${event.beacon.hwid} with device message = ${dm}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText(replyToken, message) {
  return replyText(replyToken, message.text);
}

function handleImage(replyToken, message) {
  return replyText(replyToken, 'Got Image');
}

function handleVideo(replyToken, message) {
  return replyText(replyToken, 'Got Video');
}

function handleAudio(replyToken, message) {
  return replyText(replyToken, 'Got Audio');
}

function handleLocation(replyToken, message) {
  return replyText(replyToken, 'Got Location');
}

function handleSticker(replyToken, message) {
  return replyText(replyToken, 'Got Sticker');
}

const port = config.port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
