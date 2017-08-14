const login = require('facebook-chat-api');
const mtg = require('mtgsdk');
const request = require('request');
const fs = require('fs');

// Set configuration parameters here.
// Needs to export an object with groupId, email, and password.
const config = require('./config');

const cardnameRE = new RegExp('c\/(.*)\/');

login({ email: config.email, password: config.password}, (err, api) => {
  if(err) return console.error(err);
  
  api.listen((err, message) => {
    console.info(`Message: ${message.body}`);
    if (message.threadID == config.groupId && cardnameRE.test(message.body)) {
      const name = message.body.match(cardnameRE)[1];
      console.info(`Card Name: ${name}`);

      mtg.card.where({ name }).then(cards => {
        if (cards.length > 0) {
          // get the card image
          const card = cards[0];
          const stream = request(card.imageUrl).pipe(fs.createWriteStream(`${card.id}.jpg`));
          stream.on('finish', () => {
            api.sendMessage({
              body: card.name,
              attachment: fs.createReadStream(`${__dirname}/${card.id}.jpg`)
            }, message.threadID);
          });
        }
      });
    } else {
      console.info('Didn\'t match');
    }
  });
});
