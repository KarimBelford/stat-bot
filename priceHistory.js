const {
    ticker1,
    ticker2,
    client,
    timeframe,
    klineLimit,
    signalPositiveTicker,
    t1
} = require('./botInfo')

const {getClosingPrice} = require('./calculations')

const getTimestamps = () => {
    let timeStartDate = 0;
    let timeNextDate = 0;
    let now = new Date();
    if (timeframe === 60) {
        timeStartDate = new Date(now - klineLimit * 60 * 60 * 1000);
        timeNextDate = new Date(now.getTime() + 30 * 1000);
    }
    if (timeframe === "D") {
        timeStartDate = new Date(now - klineLimit * 24 * 60 * 60 * 1000);
        timeNextDate = new Date(now.getTime() + 1 * 60 * 1000);
    }
    let timeStartSeconds = Math.round(timeStartDate.getTime() / 1000);
    let timeNowSeconds = Math.round(now.getTime() / 1000);
    let timeNextSeconds = Math.round(timeNextDate.getTime() / 1000);

    return {timeStartSeconds, timeNowSeconds, timeNextSeconds};
}

const getPrice = async(ticker) => {
    let {timeStartSeconds:startTime} = getTimestamps()
    prices = await client.getMarkPriceKline({symbol: ticker, interval: timeframe, from: startTime})
    if(prices.result.length !== klineLimit){
        return []
    }
    return prices.result
}

const getTickerPrices = async() => {
    let series1 = [];
    let series2 = [];

    let price1 = await getPrice(ticker1);
    let price2 = await getPrice(ticker2);

    series1 = getClosingPrice(price1);
    series2 = getClosingPrice(price2);

    
    return {series1,series2}

}






const getTickerLiquidity = async() => {
    let sum;
    let avgqty;
    let latestPrice;
    trades = await client.getTradeRecords({
        symbol:ticker1,
        limit:50,
       
    })

    if(trades.result){
        tradeData = trades.result.data;
        qtyList = [];
        tradeData.forEach(qtyValues => {
           
            qtyList.push(qtyValues["exec_qty"])
        });
        if(qtyList.length>0){
             sum = qtyList.reduce((a, b) => a + b, 0);
             avgqty = (sum/qtyList.length)
             latestPrice = trades.result.data[0]['exec_price']
            
        }
    }
    return {avgqty,latestPrice}
   
}








module.exports = {getTickerPrices,getTickerLiquidity}