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
If you're building for development, you need to go to ``mySkyHelper.js`` and uncomment lines #15 and #16 which hardcode the portal for development, then comment the lines that use the default portal for production.

### Deploy to Skynet

Create a ```vue-skynet_config.json``` to set a skynet portal
```
{
  "portal": "https://siasky.net",
  "enableNamebase": true,
  "namebaseDomain": "siaedit",
  "namebaseAPIKey": "",
  "namebaseAPISecret": ""
}
```
Then run the following commands to create a dist folder and upload it to skynet

```
npm run build
npm run publish
```


