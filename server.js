//import { getCoIntegration } from './calculations/CalcCoIntegration';
const {InverseClient} = require('bybit-api');
const zScore = require('z-score')
const fs = require('fs');


const API_KEY = 'WMTy0NWg8tJinG1zy0';
const API_SECRET = 'U9S0ddY4cBqzuOCcBo7gcryJQpAp3dlD7Qhb';
const useTestnet = true;

const timeStart = new Date()
const timeStamp = timeStart.getTime()

//Initalize market
const client = new InverseClient({
    key: API_KEY,
    secret: API_SECRET,
    testnet: useTestnet,
    baseUrl:'https://api-testnet.bybit.com',
    },
)

// get trade symbols
const getUsdtSymbols = async() => {
    let usdtSymbols = []
    try {
        const symbols = await client.getSymbols()
        usdtSymbols = symbols.result.filter(symbol => 
        
        symbol["name"] === "BTCUSD" || symbol["name"] === "ETHUSD"
        )
    } catch (error) {
        console.error(error)
    }
    console.log(usdtSymbols)
    return usdtSymbols
}


//get price data
const getPrices = async() => {
    try {
        const symbols = await getUsdtSymbols()
        const prices = {}
        for (const symbol of symbols) {
            const result = await client.getMarkPriceKline({symbol: symbol.name, interval: 'D', from: 1581231260})
            prices[symbol.name] = result.result
        }        
        return prices
        } catch (error) {
        console.error(error)
    } 
}

// save price history to a json file 
const priceHistory = () =>{ getPrices().then(prices => {
    fs.writeFile('prices.json', JSON.stringify(prices), (error) => {
      if (error) {
        console.error(error)
      } else {
        console.log('Prices written to file successfully!')
      }
    })
  })
}

//priceHistory()
// calculate coIntegration


const getpricedata = () =>{fs.readFile('prices.json', (err, data) => {
  if (err) throw err;

  const priceData = JSON.parse(data);
  getCoIntegrationData(priceData);
});
}

getpricedata()
const getCoData = (prices) => {
    let symbol1 = 'BTCUSD'
    let symbol2 = 'ETHUSD'
    series1 = getClosingPrice(prices[symbol1])
    series2 = getClosingPrice(prices[symbol2])
}

const getCoIntegrationData = (prices) => {
    

   
    let symbol1 = 'BTCUSD'
    let symbol2 = 'ETHUSD'
    
    
    series1 = getClosingPrice(prices[symbol1])
    series2 = getClosingPrice(prices[symbol2])
    console.log('BTCUSD',series1)
    console.log('ETHUSD',series2)
    const spread = calculateSpread(series1, series2);
    const mean = calculateMean(spread);
   // console.log(mean)
    const standardDeviation = calculateStandardDeviation(spread, mean);
   // console.log(standardDeviation)
   const zScores = []
    for (let i = 0; i < spread.length; i++) {
        zScores.push(calculateZScore(spread[i], mean, standardDeviation));
    }
    //console.log(zScores)             
    
}


const getClosingPrice = (prices) => {
    if(prices !== null && prices !== undefined){
        closePrices = [];
        prices.forEach(priceValues => {
            if(Number.isNaN(priceValues["close"])) return
            closePrices.push(priceValues["close"])
        });
        
        return closePrices
    }
}

const calculateSpread = (series1, series2) => {
    // assuming series1 and series2 are arrays of the same length
    let spread = []
    for (let i = 0; i < series1.length; i++) {
        spread.push(series1[i] - series2[i]);
    }
   // console.log(spread);
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





    