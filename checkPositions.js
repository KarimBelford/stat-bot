const {client} = require('./botInfo')

// This function checks if there are any open positions for a given ticker.
const checkOpenPositions = async(ticker) => {
    // Calls the `getPosition` method of an external API client and awaits the response.
    openPosition = await client.getPosition(ticker)
    
    // If the response contains a 'ret_msg' key with the value 'OK', there are open positions.
    if(openPosition.ret_msg === 'OK'){
        // Filters the 'data' array of the response to only include the symbol that matches the given ticker.
        usdtSymbols = openPosition.result.filter(symbol => 
            symbol.data['symbol'] === ticker
        )
        // Gets the size of the position for the ticker.
        size = usdtSymbols[0].data.size
        
        // If the size is greater than 0, there is an open position for the given ticker.
        if(size>0){
            return true;
        }
        // Otherwise, there are no open positions for the given ticker.
        return false;
    }
    // If the response doesn't contain a 'ret_msg' key with the value 'OK', there are no open positions.
    return false;
}


// This function checks if a given order is currently active.
const checkActiveOrder = async(ticker,orderId) => {
    // Calls the `getActiveOrderList` method of an external API client with the given ticker and order ID, and awaits the response.
    activeOrder = await client.getActiveOrderList({
        symbol: ticker,
        order_id: orderId
    })
    
    // If the response contains a 'ret_msg' key with the value 'OK' and the order status is either 'New' or 'PartiallyFilled', the order is active.
    if(activeOrder.ret_msg === 'OK' && activeOrder.result.data[0].order_status === ('New' || 'PartiallyFilled')){
        return true
    } else {
        // Otherwise, the order is not active.
        return false
    }
}


// This function gets the open positions for a given ticker.
const getOpenPositions = async(ticker) => {
    // Calls the `getPosition` method of an external API client and awaits the response.
    position = await client.getPosition(ticker)

    // If the response contains a 'ret_msg' key with the value 'OK', there are open positions.
    if(position.ret_msg === 'OK'){
        // Filters the 'data' array of the response to only include the symbol that matches the given ticker.
        usdtSymbols = position.result.filter(symbol => 
            symbol.data['symbol'] === ticker
        )
        // Gets the entry price and size of the open position for the ticker.
        orderPrice = usdtSymbols[0].data.entry_price
        orderQuantity = usdtSymbols[0].data.size
        // Returns an object containing the entry price and size of the open position for the ticker.
        return {orderPrice,orderQuantity}
    }
    // If the response doesn't contain a 'ret_msg' key with the value 'OK', there are no open positions.
    return(0,0)
}

const getActivePositions = async(ticker) => {
    // Retrieve the active order list for the specified ticker
    activeOrder = await client.getActiveOrderList({
        symbol: ticker,
    })
    // If the retrieval is successful, extract the order price and quantity and return them as an object
    if(activeOrder.ret_msg === 'OK'){
        orderPrice = activeOrder.result.data[0].price
        orderQuantity = activeOrder.result.data[0].qty
        return {orderPrice,orderQuantity}
    }
    // If the retrieval fails, return a tuple with 0 values
    return(0,0)
}

const queryExistingOrder = async(ticker,order_id) => {
    // Query the status of the specified order for the specified ticker
    order = await client.queryActiveOrder({
        symbol: ticker,
        order_id:order_id
    })
    // If the query is successful, extract the order price, quantity, and status and return them as an object
    if(order.ret_msg === 'OK'){
        orderPrice = order.result.price
        orderQuantity = order.result.qty
        orderStatus = order.result.order_status
       return{orderPrice,orderQuantity,orderStatus}
    }
    // If the query fails, return nothing
}


module.exports = {
    checkActiveOrder,
    checkOpenPositions,
    getActivePositions,
    getOpenPositions,
    queryExistingOrder
}