const {
    ticker1,
    ticker2,
    client
} = require('./botInfo')

const {LinearPositionIdx} = require('bybit-api');



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

closeAllPositions = async() => {
    

    await client.cancelAllActiveOrders({symbol:ticker1});
    await client.cancelAllActiveOrders({symbol:ticker2});

    const { side: side1, size: size1 } = await getTickerPositionInfo(ticker1);
    const { side: side2, size: size2 } = await getTickerPositionInfo(ticker2);
   await placeCloseOrder(ticker1,side2,size1);
   await placeCloseOrder(ticker2,side1,size2);
   
    killTrigger = 0

}

placeCloseOrder = (ticker,side,size) => {
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
