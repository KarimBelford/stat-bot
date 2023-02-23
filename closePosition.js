const {
    ticker1,
    ticker2,
    client
} = require('./botInfo')

const {LinearPositionIdx} = require('bybit-api');

/*
retrieves the size and side of a given ticker's position 
using the getPosition() method from API. The function 
then filters the result to get the symbol data for the specified ticker, 
and returns an object containing the side and size
 */
const getTickerPositionInfo = async(ticker) => {
    let usdSymbols = [];
    const position = await client.getPosition(ticker)
    let size = 0
    let side = ''
    usdSymbols = position.result.filter(symbol => 
        
        symbol.data['symbol'] === ticker
    )
   
    size = usdSymbols[0].data.size
    side = usdSymbols[0].data.side

    return {side,size}

}

/*
This function closes all open positions for tickers. 
It first cancels any active orders for the two tickers 
using the cancelAllActiveOrders() method from API. 
Then, it uses the getTickerPositionInfo() function to get the 
side and size of each position, and places a market order to close each position
 */
const closeAllPositions = async() => {

    await client.cancelAllActiveOrders({symbol:ticker1});
    await client.cancelAllActiveOrders({symbol:ticker2});

    const { side: side1, size: size1 } = await getTickerPositionInfo(ticker1);
    const { side: side2, size: size2 } = await getTickerPositionInfo(ticker2);

    await placeCloseOrder(ticker1,side1,size1);
    await placeCloseOrder(ticker2,side2,size2);

    return 0
}

/*
places a market order to close the position for a given ticker. 
It first determines whether the original order was a buy or a sell,
 and sets the side of the close order to the opposite value. Then, 
 it uses the placeActiveOrder() method from API to place the market 
 order to close the position
*/
placeCloseOrder = (ticker,side,size) => {
    if(side === 'Buy'){
        side = 'Sell'
    }else{
        side = 'Buy'
    }
     client.placeActiveOrder({
        side: side,
        symbol: ticker,
        order_type: 'Market',
        qty: size,
        time_in_force: 'GoodTillCancel',
        reduce_only: true,
        close_on_trigger: false,
        position_idx: LinearPositionIdx.OneWayMode,
    })

}


module.exports = {closeAllPositions}
