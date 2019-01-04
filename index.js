'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const config = require('./config.json');
const {PythonShell} = require('python-shell');
const {promisify} = require('util');
const fs = require('fs')

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
    if (event.replyToken === '00000000000000000000000000000000' ||
      event.replyToken === 'ffffffffffffffffffffffffffffffff') {
      return;
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
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':

        const inputCommand = message.text.split(' ');

        if(inputCommand.length == 1 && inputCommand[0] == 'help'){

          message.text = 'This line bot function have \n - get deveices all , command = get device summary \n - get device by ip , command = get device ip "ip address" \n - get device by serial number , command = get device sn "Serial Number"'
          return handleText(message, event.replyToken);
        }else if(inputCommand.length >= 3 && inputCommand[0] == 'get' && inputCommand[1] == 'device') {

          if(inputCommand.length == 3){
              if(inputCommand[2] == 'summary'){
                var parthPythonSummary = 'getDeviceSummary.py'
                const runPy = new PythonShell(parthPythonSummary);
                let msg = ''
                runPy.on('message' , function(response){
                  msg += response
                  msg += '\n'
                });

                return runPy.end(() => {
                  console.log('Collecting response done.')
                  message.text = msg
                  console.log('Sending back to client.')
                  return handleText(message, event.replyToken)
                })
              }else{
                return invalidCommand(message, event.replyToken)
              }
            }else if (inputCommand.length >= 4){
            if(inputCommand.length == 4 && inputCommand[2] == 'ip'){

              var parthPythonSummary = 'getDeviceIP.py'
              let options = {
                args : [inputCommand[3]]
              };

              const runPy = new PythonShell(parthPythonSummary, options);
              console.log(options)
              let msg = ''
              runPy.on('message', function(response){
                msg += response
                msg += '\n'
              });

              return runPy.end(() => {
                console.log('Collecting response done.')
                message.text = msg
                console.log('Sending back to client.')
                return handleText(message, event.replyToken)
              })

              }else if (inputCommand.length == 4 && inputCommand[2] == 'sn'){

                var parthPythonSummary = 'getDeviceSN.py'
                let options = {
                  args : [inputCommand[3]]
                };

                const runPy = new PythonShell(parthPythonSummary, options);
                console.log(options)
                let msg = ''
                runPy.on('message', function(response){
                  msg += response
                  msg += '\n'
                });

                return runPy.end(() => {
                  console.log('Collecting response done.')
                  message.text = msg
                  console.log('Sending back to client.')
                  return handleText(message, event.replyToken)
                })

            }else{

              return invalidCommand(message, event.replyToken)

            }

          }
        }else {

          message.text = 'Please use "help" to show how to use this bot'
          return handleText(message, event.replyToken)

        }
          return handleText(message, event.replyToken);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
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

function handleText(message, replyToken) {
  return replyText(replyToken, message.text);
}

function handleImage(message, replyToken) {
  return replyText(replyToken, 'Got Image');
}

function handleVideo(message, replyToken) {
  return replyText(replyToken, 'Got Video');
}

function handleAudio(message, replyToken) {
  return replyText(replyToken, 'Got Audio');
}

function handleLocation(message, replyToken) {
  return replyText(replyToken, 'Got Location');
}

function handleSticker(message, replyToken) {
  return replyText(replyToken, 'Got Sticker');
}

function invalidCommand(message, replyToken){
  message.text = 'Command is invalid. Please check command by "help".'
  return handleText(message, replyToken);
}

const port = config.portNodeJS;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
