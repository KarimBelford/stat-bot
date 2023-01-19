const {
    ticker1,
    ticker2,
} = require('./bot')

const {InverseClient} = require('bybit-api');
const API_KEY = 'WMTy0NWg8tJinG1zy0';
const API_SECRET = 'U9S0ddY4cBqzuOCcBo7gcryJQpAp3dlD7Qhb';
const useTestnet = true;

//Initalize market
const client = new InverseClient({
    key: API_KEY,
    secret: API_SECRET,
    testnet: useTestnet,
    strict_param_validation: true,
    baseUrl:'https://api-testnet.bybit.com',
    },
)

const getTickerPosition = async(ticker) => {
    let usdSymbols = [];
    const position = await client.getPosition(ticker)
    let size = 0
    let side = ''
    usdSymbols = position.result.filter(symbol => 
        
        symbol.data['symbol'] === ticker
        )
    //console.log(usdSymbols[0].data.size)
    
    if(usdSymbols[0].data.size > 0){
        size = usdSymbols[0].data.size
        side = 'Buy' 
    }else{
        size = usdSymbols[0].data.size
        side = 'Sell'
    }

    //console.log({size,side})
    return({size,side})

}




placeCloseOrder = async(ticker,side,size) => {
    
   

}

client.placeActiveOrder({
    side:'Sell',
    symbol:ticker1,
    order_type:'Market',
    qty:5,
    time_in_force: 'GoodTillCancel',
    reduce_only: true,
})
closeAllPositions = async() => {
   
    
    client.cancelActiveOrder(ticker1);
   
    const { side1, size1 } = await getTickerPosition(ticker1)
    const { side2, size2 } = await getTickerPosition(ticker2)

    if (size1>0) placeCloseOrder(ticker1,'Sell',size1);
   
    killTrigger = 0
}

closeAllPositions();