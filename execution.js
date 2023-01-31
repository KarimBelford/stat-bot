const {
    ticker1,
    ticker2,
    client,
    ws,
    ws1,
    ws2,
    capital,
} = require('./botInfo')
const {LinearPositionIdx} = require('bybit-api');

const{getTradeDetails1,getTradeDetails2} = require('./calculations')

const settingLeverage = (ticker) => {
    serLeverage = client.setMarginSwitch({
        symbol: ticker,
        is_isolated: true,
        buy_leverage: 1,
        sell_leverage:1
    })
}

const placeMarketOrder = async(ticker,quantity, direction,stopLoss) => {
    if(direction === 'Long'){
        side = 'Buy'
    }else{
        side = 'Sell'
    }
    order = await client.placeActiveOrder({
        side: side,
        symbol: ticker,
        order_type: 'Market',
        qty: quantity,
        time_in_force: 'GoodTillCancel',
        reduce_only: false,
        close_on_trigger: false,
        stop_loss:stopLoss,
        position_idx: LinearPositionIdx.OneWayMode,
    })
    const orderID = order.result['order_id']

    return (orderID)
}






  


const initializeOrder = (ticker, direction, capital) => {
    return new Promise((resolve, reject) => {
        ws1.subscribe(`trade.${ticker}`);
        let isCalled = false;
        let counts = 0
        ws1.on('update', async(data) => {
            if (!isCalled) {                       
                    const {orderPrice: orderPrice, stopLoss: stopLoss, quantity: quantity} =  getTradeDetails1(ticker,data, direction, capital);
                    if(quantity>0 && isCalled === false){
                        const order = await placeLimitOrder(ticker,orderPrice,quantity,direction,stopLoss)
                        isCalled = true
                        ws1.unsubscribe([`trade.${ticker}`])
                        resolve({order})
                    }                
            }
        });
    });
}

const initializeOrder1 = (ticker, direction, capital) => {
    return new Promise((resolve, reject) => {
        ws1.subscribe(`trade.${ticker}`);
        let isCalled = false;
        let counts = 0
        ws1.on('update', async(data) => {
            if (!isCalled) {                       
                    const {orderPrice: orderPrice, stopLoss: stopLoss, quantity: quantity} =  getTradeDetails2(ticker,data, direction, capital);
                    if(quantity>0 && isCalled === false){
                        const order = await placeLimitOrder(ticker,orderPrice,quantity,direction,stopLoss)
                        isCalled = true
                        ws1.unsubscribe([`trade.${ticker}`])
                        resolve({order})
                    }                
            }
        });
    });
}

const initializeOrder2 = (ticker, direction, capital) => {
    return new Promise((resolve, reject) => {
        ws2.subscribe(`trade.${ticker}`);
        let isCalled = false;
        let counts = 0
        ws2.on('update', async(data) => {
            if (!isCalled) {                       
                    const {orderPrice: orderPrice, stopLoss: stopLoss, quantity: quantity} =  getTradeDetails2(ticker,data, direction, capital);
                    console.log('short',quantity,orderPrice,stopLoss)
                    if(quantity>0 && isCalled === false){
                        const order = await placeLimitOrder(ticker,orderPrice,quantity,direction,stopLoss)
                        isCalled = true
                        ws2.unsubscribe([`trade.${ticker}`])
                        resolve({order})
                    }                
            }
        });
    });
}




/*initializeOrder2(ticker2,'Short',2000)
.then((order) => {
    console.log(order)
})
.catch((error) => {
    console.log(error)
});
*/

const placeLimitOrder = async(ticker,price,quantity, direction,stopLoss) => {

    if(direction === 'Long'){
        side = 'Buy'
    }else{
        side = 'Sell'
    }
    order = await client.placeActiveOrder({
        side: side,
        symbol: ticker,
        price:price,
        order_type: 'Limit',
        qty: quantity,
        time_in_force: 'GoodTillCancel',
        reduce_only: false,
        close_on_trigger: false,
        stop_loss:stopLoss,
        position_idx: LinearPositionIdx.OneWayMode,
    })
    const orderID = order.result['order_id']

    return (orderID)
}




module.exports = {initializeOrder,initializeOrder1,settingLeverage}