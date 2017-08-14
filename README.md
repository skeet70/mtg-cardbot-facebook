# Facebook Group Chat Cardbot

```sh
yarn install
vim config.js
node index.js
```

`config.js` should look like:

```js
module.exports = {
  groupId: '00000000000', // id of FB thread to watch/post to
  email: 'your_fb_login@email.com',
  password: 'your_fb_password'
}
```