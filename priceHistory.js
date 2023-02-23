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
/*
function is used to get the start time, end time, 
and next time interval based on the given timeframe and kline limit
*/
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
/*
function is used to get the market prices for the given ticker and time period
uses getMarkPriceKline () method from API
 */
const getPrice = async(ticker) => {
    let {timeStartSeconds:startTime} = getTimestamps()
    prices = await client.getMarkPriceKline({symbol: ticker, interval: timeframe, from: startTime})
    if(prices.result.length !== klineLimit){
        return []
    }
    return prices.result
}

/*
function to fetch the prices of two different 
tickers. Then it calls getClosingPrice() 
function to extract the closing prices from 
the price data and assigns them to two different arrays 
 */
const getTickerPrices = async() => {
    let series1 = [];
    let series2 = [];

    let price1 = await getPrice(ticker1);
    let price2 = await getPrice(ticker2);

    series1 = getClosingPrice(price1);
    series2 = getClosingPrice(price2);

    
    return {series1,series2}

}

/*
function uses client.getTradeRecords() method from API
to retrieve the trade records a ticker with a limit of 50. 
Then, it checks if the result contains any data, and  
it extracts the exec_qty field from each record and 
calculates the sum and average of these values.
 */
const getTickerLiquidity = async(ticker) => {
    let sum;
    let avgqty;
    let latestPrice;
    trades = await client.getTradeRecords({
        symbol:ticker,
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