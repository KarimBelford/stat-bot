const {InverseClient} = require('bybit-api');
const fs = require('fs');


const ticker1 = 'BTCUSD';
const ticker2 = 'ETHUSD';

signalPositiveTicker = ticker2;
signalNegativeTicker = ticker1;
roundingTicker1 = 2;
roundingTicker2 = 2;
quantityRoundingTicker1 = 0;
quantityRoundingTicker2 = 0;

limitOrderBasis = true;

tradingCapital = 2000;
failSafe = 0.20;

signalTrigger = 1.1;

timeframe = 60;
kline_limit = 200;
zScoreWindow = 21;

const API_KEY = 'WMTy0NWg8tJinG1zy0';
const API_SECRET = 'U9S0ddY4cBqzuOCcBo7gcryJQpAp3dlD7Qhb';
const useTestnet = true;


//Initalize market
const client = new InverseClient({
    key: API_KEY,
    secret: API_SECRET,
    testnet: useTestnet,
    baseUrl:'https://api-testnet.bybit.com',
    },
)

module.exports = {
    ticker1, 
    ticker2,
    failSafe,
    roundingTicker1,
    roundingTicker2,
    quantityRoundingTicker1,
    quantityRoundingTicker2
}