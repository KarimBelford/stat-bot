const {
    ws,
    ticker1,
    ticker2,
    failSafe,
    capital,
    roundingTicker1,
    roundingTicker2,
    quantityRoundingTicker1,
    quantityRoundingTicker2
} = require('./botInfo')
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
const bidItems1 = [];
const askItems1 = [];
const bidItems2 = [];
const askItems2 = [];

const getTradeDetails1 = (ticker,orderbook, direction = 'Long', capital) => {
    let priceRounding = 20;
    let quantityRounding = 20;
    let orderPrice = 0;
    let quantity = 0;
    let stopLoss= 0;
    
   

    if(orderbook.data){
        
        if(orderbook.data[0]['symbol']=== ticker1){
            priceRounding = roundingTicker1;
            quantityRounding = quantityRoundingTicker1;
        }else{
            priceRounding = roundingTicker2;
            quantityRounding= quantityRoundingTicker2;
        }
        if(ticker === ticker1){
            orderbook.data.forEach(level =>{
                if(level['symbol']===ticker1 && level['side'] === 'Buy'){
                    bidItems1.push(level['price']);
                }
                else if(level['symbol']===ticker1 && level['side'] === 'Sell'){
                    askItems1.push(level['price']);
                }
    
                
            })
        }else{
            orderbook.data.forEach(level =>{
                if(level['symbol']===ticker2 && level['side'] === 'Buy'){
                    bidItems1.push(level['price']);
                }
                else if(level['symbol']===ticker2 && level['side'] === 'Sell'){
                    askItems1.push(level['price']);
                }
    
                
            })
        }
        
        if(bidItems1.length>0 && askItems1.length>0){
          bidItems1.sort((a,b) => b-a); 
          askItems1.sort((a,b) => a-b);

          

          nearestAsk = askItems1[0];
          nearestBid = bidItems1[0];
            
          if(direction === "Long"){
            orderPrice = Number(nearestBid);
            stopLoss = Math.round(orderPrice*(1-failSafe),priceRounding)
          }else{
            orderPrice = Number(nearestAsk);
            stopLoss = Math.round(orderPrice*(1+failSafe),priceRounding)
          }

          quantity = Math.round(capital/orderPrice,quantityRounding)
        }
        
            return{orderPrice,stopLoss,quantity}
        

    }
} 

const getTradeDetails2 = (ticker,orderbook, direction = 'Short', capital) => {
    let priceRounding = 20;
    let quantityRounding = 20;
    let orderPrice = 0;
    let quantity = 0;
    let stopLoss= 0;
    
   

    if(orderbook.data){
        
        if(orderbook.data[0]['symbol']=== ticker2){
            priceRounding = roundingTicker2;
            quantityRounding = quantityRoundingTicker2;
        }else{
            priceRounding = roundingTicker1;
            quantityRounding= quantityRoundingTicker1;
        }

        if(ticker === ticker2){
            orderbook.data.forEach(level =>{
                
                if(level['symbol']===ticker2 && level['side'] === 'Buy'){
                    bidItems2.push(level['price']);
                }
                else if(level['symbol']===ticker2 && level['side'] === 'Sell'){
                    askItems2.push(level['price']);
                }                
            })
        }else{
            orderbook.data.forEach(level =>{
                if(level['symbol']===ticker1 && level['side'] === 'Buy'){
                    bidItems1.push(level['price']);
                }
                else if(level['symbol']===ticker1 && level['side'] === 'Sell'){
                    askItems1.push(level['price']);
                }                
            })
        }
        
        if(bidItems2.length>0 && askItems2.length>0){
          bidItems2.sort((a,b) => a-b).reverse(); 
          askItems2.sort((a,b) => a-b);

          nearestAsk = askItems2[0];
          nearestBid = bidItems2[0];

          if(direction === "Long"){
            orderPrice = Number(nearestBid);
            stopLoss = Math.round(orderPrice*(1-failSafe),priceRounding)
          }else{
            orderPrice = Number(nearestAsk);
            stopLoss = Math.round(orderPrice*(1+failSafe),priceRounding)
          }

          quantity = Math.round(capital/orderPrice,quantityRounding)
        }
        return{orderPrice,stopLoss,quantity}


    }
}

module.exports ={
    getTradeDetails1,
    getTradeDetails2,
    getClosingPrice
}

