const {
    ticker1,
    ticker2,
    failSafe,
    roundingTicker1,
    roundingTicker2,
    quantityRoundingTicker1,
    quantityRoundingTicker2
} = require('./bot')
const { WebsocketClient } = require('bybit-api');

const getClosingPrice = (prices) => {
    if(prices !== null && prices !== undefined){
        let closePrices = [];
        prices.forEach(priceValues => {
            if(Number.isNaN(priceValues["close"])) return
            closePrices.push(priceValues["close"])
        });
        
        return closePrices
    }
}
    const bidItems = [];
    const askItems = [];
const getTradeDetails = (orderbook, direction = 'Long', capital) => {
    let priceRounding = 20;
    let quantityRounding = 20;
    let orderPrice = 0;
    let quantity = 0;
    let stopLoss= 0;
    
   

    if(orderbook.data){
        //console.log(orderbook.data)
        if(orderbook.data[0]['symbol']=== ticker1){
            priceRounding = roundingTicker1;
            quantityRounding = quantityRoundingTicker1;
        }else{
            priceRounding = roundingTicker2;
            quantityRounding= quantityRoundingTicker2;
        }
        orderbook.data.forEach(level =>{
            if(level['side'] === 'Buy'){
                bidItems.push(level['price']);
            }
            else{
                askItems.push(level['price']);
            }
        })
        console.log('bid',bidItems)
        console.log('ask',askItems)
        if(bidItems.length>0 && askItems.length>0){
          bidItems.sort((a,b) => a-b).reverse(); 
          askItems.sort((a,b) => a-b);

          nearestAsk = askItems[0];
          nearestBid = bidItems[0];

          if(direction === "Long"){
            orderPrice = nearestBid;
            stopLoss = Math.round(orderPrice*(1-failSafe),priceRounding)
          }else{
            orderPrice = nearestAsk;
            stopLoss = Math.round(orderPrice*(1-failSafe),priceRounding)
          }

          quantity = Math.round(capital/orderPrice,quantityRounding)
        }
       // console.log(orderPrice,stopLoss,quantity)
        return{orderPrice,stopLoss,quantity}


    }
}

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
    getTradeDetails(data,'Long',20000)
   //console.log('raw message received ', data);
     //console.log('raw message received ', JSON.stringify(data, null, 2));
  });

