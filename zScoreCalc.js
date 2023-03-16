const {
    ticker1,
    ticker2,
    ws,
    client,
    timeframe,
    klineLimit
} = require('./botInfo')

const {getTradeDetails1,getTradeDetails2} = require('./calculations')
const {getTickerPrices} = require('./priceHistory')

const getLatestZscore = async() =>{
    ws.subscribe([`trade.${ticker1}`,`trade.${ticker2}`])
    let isCalled1 = false;
    let latestZscore;
    let signalPositive;

    return new Promise((resolve, reject) => {
        const orderbook1 = ws.on('update', async(data) => {
            if (!isCalled1) {
                const {orderPrice: orderPrice1} = getTradeDetails1(ticker1,data);
                const {orderPrice: orderPrice2} = getTradeDetails1(ticker2,data);
                if(orderPrice1 && orderPrice2>0){
                    isCalled1 = true 
                    let {series1,series2} = await getTickerPrices()
                    
                    if(series1.length > 0 && series2.length > 0){
                        series1.pop()
                        series2.pop();
                        series1.push(orderPrice1);
                        series2.push(orderPrice2);
                        const hedgeRatio = calculateHedgeRatio(series1,series2)
                        const spread = calculateSpread(series1, series2,hedgeRatio);
                        const mean = calculateMean(spread);
                        const standardDeviation = calculateStandardDeviation(spread, mean);
                        const zScores = spread.map((value) => calculateZScore(value, mean, standardDeviation));                        
                        latestZscore = zScores.pop()
                        console.log(latestZscore)
                        if(latestZscore > 0){
                            signalPositive = true
                        }else {
                            signalPositive = false
                        }
                        ws.unsubscribe([`trade.${ticker1}`,`trade.${ticker2}`])
                        resolve({latestZscore,signalPositive});
                    }
                }
            }
        });
    });
}



const calculateSpread = (series1, series2, hedgeRatio) => {
    // assuming series1 and series2 are arrays of the same length
    let spread = [];
    for (let i = 0; i < series1.length; i++) {
      spread.push(series1[i] - hedgeRatio * series2[i]);
    }
    return spread;
  }
  

const calculateMean = (spread) => {
    let sum = 0;
    for (let i = 0; i < spread.length; i++) {
        sum += spread[i];
    }
    return sum / spread.length;
}

const calculateStandardDeviation = (spread, mean) => {
    let sum = 0;
    for (let i = 0; i < spread.length; i++) {
        sum += Math.pow(spread[i] - mean, 2);
    }
    return Math.sqrt(sum / (spread.length - 1));
}

const calculateZScore = (x, mean, standardDeviation) => {
    return (x - mean) / standardDeviation;
}

const calculateHedgeRatio = (series1, series2) => {
    const x = series1
    const y = series2
    const n = x.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXsq = 0;
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXsq += x[i] * x[i];
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXsq - sumX * sumX);
    return slope;
}




module.exports = {getLatestZscore}

