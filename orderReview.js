const {
    ws, ticker2,
} = require('./botInfo')
const {
    getTradeDetails1
} = require('./calculations')
const {
    getActivePositions,
    getOpenPositions,
    queryExistingOrder
} = require('./checkPositions')


const reviewOrder = async(ticker,order_id,remainingCapital,direction) => {
    return new Promise((resolve, reject) => {
        ws.subscribe(`trade.${ticker}`);
        let isCalled = false
        ws.on('update', async(data) => {        
            if (!isCalled) {
                const {orderPrice: latestPrice} = getTradeDetails1(ticker,data,direction);
                if(latestPrice>0){
                    isCalled = true
                    const {order: orderPrice,orderQuantity:orderQuantity,orderStatus:status} = await queryExistingOrder(ticker,order_id)
                    const {orderPrice:positionPrice,orderQuantity:positionQty} = await getOpenPositions(ticker)
                    const {orderPrice:activeOrderPrice,orderQuantity:activeOrderQty} = await getActivePositions(ticker)
                    ws.unsubscribe([`trade.${ticker}`])
                    console.log(positionQty,remainingCapital)
                    if(positionQty >= remainingCapital && positionQty>0) resolve('Trade Complete');

                    if(status === 'Filled') resolve('Position Filled');

                    if(status === 'Created' || 'New') resolve("Order Active");

                    if(status === 'PartiallyFilled') resolve("Partial Fill");

                    if(status === 'Cancelled' || 'Rejected'||'PendingCancel') resolve("Try Again");

                }
            }
        }) 
    });
}



module.exports = {reviewOrder}