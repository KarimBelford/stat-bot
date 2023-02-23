const {ws} = require('./botInfo')
const {getTradeDetails1} = require('./calculations')
const {
    getActivePositions,
    getOpenPositions,
    queryExistingOrder
} = require('./checkPositions')

/*This function monitors the state of a trade order 
and resolves a Promise with a message indicating the current state.
*/
const reviewOrder = async(ticker,order_id,remainingCapital,direction) => {
    return new Promise((resolve, reject) => {
        ws.subscribe(`trade.${ticker}`);
        let isCalled = false
        ws.on('update', async(data) => {        
            if (!isCalled) {
                const {orderPrice: latestPrice} = getTradeDetails1(ticker,data,direction);
                if(latestPrice>0){
                    isCalled = true
                    //getting the current order status 
                    const {order: orderPrice,orderQuantity:orderQuantity,orderStatus:status} = await queryExistingOrder(ticker,order_id)
                    const {orderPrice:positionPrice,orderQuantity:positionQty} = await getOpenPositions(ticker)
                   // const {orderPrice:activeOrderPrice,orderQuantity:activeOrderQty} = await getActivePositions(ticker)
                    ws.unsubscribe([`trade.${ticker}`])
                    console.log(positionQty,remainingCapital)
                    //check status of trade order
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