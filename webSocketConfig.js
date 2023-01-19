const {ticker1,ticker2} = require('./bot')
const { WebsocketClient } = require('bybit-api');
const API_KEY = 'WMTy0NWg8tJinG1zy0';
const PRIVATE_KEY = 'U9S0ddY4cBqzuOCcBo7gcryJQpAp3dlD7Qhb';

const wsConfig = {
    key: API_KEY,
    secret: PRIVATE_KEY,
    testnet: true,
    market: 'inverse',
    wsUrl: 'wss://stream-testnet.bybit.com/realtime'
};

const ws = new WebsocketClient(wsConfig);



// and/or subscribe to individual topics on demand
ws.subscribe([`trade.${ticker1}`,`trade.${ticker2}`]);
ws.on('update', (data) => {
    console.log('raw message received ', data);
    // console.log('raw message received ', JSON.stringify(data, null, 2));
  });

// Listen to events coming from websockets. This is the primary data source
