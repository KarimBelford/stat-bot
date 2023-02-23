const {LinearClient,WebsocketClient} = require('bybit-api');
const fs = require('fs');


// let ticker2 = 'SLPUSDT'
// let ticker1 = 'AXSUSDT'
let ticker1 = 'TLMUSDT'
let ticker2 = 'SXPUSDT'
let capital = 20000

signalPositiveTicker = ticker1;
signalNegativeTicker = ticker2;
roundingTicker1 = 3;
roundingTicker2 = 5;
quantityRoundingTicker1 = 1;
quantityRoundingTicker2 = 0;

limitOrderBasis = true;

tradingCapital = 50;
failSafe = 0.25;

signalTrigger = 0.1;

timeframe = 60;
klineLimit = 200;
zScoreWindow = 21;

const API_KEY = 'WMTy0NWg8tJinG1zy0';
const API_SECRET = 'U9S0ddY4cBqzuOCcBo7gcryJQpAp3dlD7Qhb';
const useTestnet = true;


//Initalize market
let client = new LinearClient({
    key: API_KEY,
    secret: API_SECRET,
    testnet: useTestnet,
    strict_param_validation: true,
    baseUrl:'https://api-testnet.bybit.com',
    },
)

const wsConfig = {
    key: API_KEY,
    secret: API_SECRET,
    testnet: true,
    market: 'linear',
    wsUrl: 'wss://stream-testnet.bybit.com/realtime_public'
};

const ws = new WebsocketClient(wsConfig);
const ws1 = new WebsocketClient(wsConfig);
const ws2 = new WebsocketClient(wsConfig);









module.exports = {
    client,
    ws,
    ws1,
    ws2,
    signalPositiveTicker,
    signalNegativeTicker,
    signalTrigger,
    capital,
    ticker1, 
    ticker2,
    failSafe,
    timeframe,
    klineLimit,
    roundingTicker1,
    roundingTicker2,
    quantityRoundingTicker1,
    quantityRoundingTicker2
}