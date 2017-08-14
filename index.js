const login = require('facebook-chat-api');
const mtg = require('mtgsdk');
const request = require('request');
const fs = require('fs');

// Set configuration parameters here in the environment.
// Expects GROUP_ID (thread id), EMAIL, and PASSWORD.

const cardnameRE = new RegExp('[Cc]\/(.*)\/');

login({ email: process.env.EMAIL, password: process.env.PASSWORD }, (err, api) => {
  if(err) return console.error(err);
  
  api.listen((err, message) => {
    console.info(`Message: ${message.body}`);
    if (message.threadID == process.env.GROUP_ID && cardnameRE.test(message.body)) {
      const name = message.body.match(cardnameRE)[1];
      console.info(`Card Name: ${name}`);

      mtg.card.where({ name }).then(cards => {
        if (cards.length > 0) {
          // get the card image
          const card = cards[0];
          console.info(`Found Card Name: ${card.name}`);

          // send the FB message
          const stream = request(card.imageUrl).pipe(fs.createWriteStream(`${card.id}.jpg`));
          stream.on('finish', () => {
            api.sendMessage({
              body: card.name,
              attachment: fs.createReadStream(`${__dirname}/${card.id}.jpg`)
            }, message.threadID);

            // clean up
            fs.unlink(`${__dirname}/${card.id}.jpg`, err => {
              err ? console.error(err) : console.info(`Deleted ${card.id}.jpg`);
            });
          });
        }
      });
    } else {
      console.info('Didn\'t match');
    }
  });
});
