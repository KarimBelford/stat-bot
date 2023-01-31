const {
    
    client, ticker1,ticker2
} = require('./botInfo')

const {LinearPositionIdx} = require('bybit-api');

const checkOpenPositions = async(ticker) => {
    openPosition = await client.getPosition(ticker)
    
    if(openPosition.ret_msg === 'OK'){
        
        usdtSymbols = openPosition.result.filter(symbol => 
        
            symbol.data['symbol'] === ticker
        )
        size = usdtSymbols[0].data.size
        
        if(size>0){
            return true;
        }
        return false;

    }
    
    return false;
    
}






const checkActiveOrder = async(ticker,orderId) => {

    
    activeOrder = await client.getActiveOrderList({
        symbol: ticker,
        order_id: orderId
        
    })
    
    if(activeOrder.ret_msg === 'OK' && activeOrder.result.data[0].order_status === ('New' || 'PartiallyFilled')){
      return true
    }else {
        return false
    }

}


const getOpenPositions = async(ticker) => {
    position = await client.getPosition(ticker)

    if(position.ret_msg === 'OK'){
        usdtSymbols = position.result.filter(symbol => 
        
            symbol.data['symbol'] === ticker
        )
        orderPrice = usdtSymbols[0].data.entry_price
        orderQuantity = usdtSymbols[0].data.size
        return {orderPrice,orderQuantity}
        
    }
    return(0,0)

}

const getActivePositions = async(ticker) => {

    activeOrder = await client.getActiveOrderList({
        symbol: ticker,
        
    })
    if(activeOrder.ret_msg === 'OK'){
        orderPrice = activeOrder.result.data[0].price
        orderQuantity = activeOrder.result.data[0].qty
        return {orderPrice,orderQuantity}
      
      }
      return(0,0)
}

const queryExistingOrder = async(ticker,order_id) => {
    order = await client.queryActiveOrder({
        symbol: ticker,
        order_id:order_id
    })

    if(order.ret_msg === 'OK'){
        orderPrice = order.result.price
        orderQuantity = order.result.qty
        orderStatus = order.result.order_status
       return{orderPrice,orderQuantity,orderStatus}
    }
   
}

queryExistingOrder(ticker2,'f20140bb-ac3e-4582-b06d-6d9c7d128740')

module.exports = {
    checkActiveOrder,
    checkOpenPositions,
    getActivePositions,
    getOpenPositions,
    queryExistingOrder
}