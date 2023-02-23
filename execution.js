const {
    client,
    ws1,
    ws2,
} = require('./botInfo')
const {LinearPositionIdx} = require('bybit-api');

const{getTradeDetails1,getTradeDetails2} = require('./calculations')

//setting leverage using the setMargin method from API
const settingLeverage = (ticker) => {
    serLeverage = client.setMarginSwitch({
        symbol: ticker,
        is_isolated: true,
        buy_leverage: 1,
        sell_leverage:1
    })
}

/*
places a market order for a given ticker. 
It first determines whether to buy or a sell,
based on the direction. Then,it uses the placeActiveOrder() 
method from API to place the market order
*/
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

//Initializes a market order for the given ticker, direction, and capital.
const initializeOrder = (ticker, direction, capital) => {
    return new Promise((resolve, reject) => {
        // Subscribe to the trade data for the given ticker
        ws1.subscribe(`trade.${ticker}`);

        // Initialize variables to keep track of the order status and update counts
        let isCalled = false;

        // Listen for updates to the trade data for the subscribed ticker
        ws1.on('update', async(data) => {
            // Check if the order has not yet been placed
            if (!isCalled) {
                // Get the order details based on the trade data
                const {orderPrice: orderPrice, stopLoss: stopLoss, quantity: quantity} = getTradeDetails1(ticker, data, direction, capital);
                
                // Check if the order quantity is greater than 0 and the order has not yet been placed
                if (quantity > 0 && isCalled === false) {
                    // Place the market order
                    const order = await placeMarketOrder(ticker, quantity, direction, stopLoss);

                    // Set the isCalled flag to true, unsubscribe from the trade data, and resolve the promise with the order object
                    isCalled = true;
                    ws1.unsubscribe([`trade.${ticker}`]);
                    resolve({order});
                }                
            }
        });
    });
}

//Initializes a market order for the given ticker, direction, and capital.
const initializeOrder1 = (ticker, direction, capital) => {
    return new Promise((resolve, reject) => {
        // Subscribe to the trade data for the given ticker
        ws2.subscribe(`trade.${ticker}`);

        // Initialize variables to keep track of the order status and update counts
        let isCalled = false;
        
        // Listen for updates to the trade data for the subscribed ticker
        ws2.on('update', async(data) => {
            // Check if the order has not yet been placed
            if (!isCalled) {
                // Get the order details based on the trade data
                const {orderPrice: orderPrice, stopLoss: stopLoss, quantity: quantity} = getTradeDetails2(ticker, data, direction, capital);
                
                // Check if the order quantity is greater than 0 and the order has not yet been placed
                if (quantity > 0 && isCalled === false) {
                    // Place the market order
                    const order = await placeMarketOrder(ticker, quantity, direction, stopLoss);

                    // Set the isCalled flag to true, unsubscribe from the trade data, and resolve the promise with the order object
                    isCalled = true;
                    ws2.unsubscribe([`trade.${ticker}`]);
                    resolve({order});
                }                
            }
        });
    });
}


/*
places a limit order for a given ticker. 
It first determines whether to buy or a sell,
based on the direction. Then,it uses the placeActiveOrder() 
method from API to place the market order
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