# SiaEdit
*[Try it out!](https://siaedit.hns.siasky.net/)*

> Full-featured, open-source Markdown editor that stores your data on Sia's decentralized storage layer.

SiaEdit is a fork of [StackEdit](https://stackedit.io/). All the credits of building the initial app go to StackEdit's builder. We will build on top of his app and use [Sia](https://sia.tech)'s tech to allow users to fully own their data.

## Roadmap

 - [x] Add an integration to Skynet (using [SkyId](https://github.com/DaWe35/SkyID))
 - [x] Finish rebranding of the app
 - [x] Remove the server side of the app
 - [x] Deploy the app as a Skapp with it's custom Handshake domain
 - [x] Add ability to publish notes to Skynet using [MySky](https://siasky.net/docs/#mysky)
- [ ] Add Handshake integration to publish static websites

### Build

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
node build/dev-server.js

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

### Deploy to Skynet
```
npm run build
node deploy_skynet.js
```


