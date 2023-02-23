const {
    ws,
    client,
    signalPositiveTicker,
    signalNegativeTicker,
    signalTrigger,
    capital,
} = require('./botInfo')
const {getTickerLiquidity} = require('./priceHistory')
const{getLatestZscore} = require('./zScoreCalc')
const{initializeOrder, initializeOrder1} = require('./execution')
const {reviewOrder} = require('./orderReview')
const { checkActiveOrder } = require('./checkPositions')

//funtion used to manage new trade 
const manageNewTrade = (killSwitch) => {
    return new Promise(async(resolve,reject) =>{   
    let signalSide = ''
    let hot = false;
    let longTicker
    let shortTicker 
    let avgliguidityLong 
    let avgliguidityShort 
    let latestPriceLong 
    let latestPriceShort

    //get zScore before and if its positive or negative
    let {latestZscore,signalPositive} = await getLatestZscore();

    //console.log('initial zScore',latestZscore)
        
    //check if zScore is above threshold
    if(Math.abs(latestZscore)> signalTrigger){
        hot = true
    }

    //start trade if zScore above threshold and killSwitch is 0
    if(hot && killSwitch===0){
        //check how liquid each ticker is 
        const {avgqty:avgqty1,latestPrice:latestPrice1} = await getTickerLiquidity(signalPositiveTicker)
        const {avgqty:avgqty2,latestPrice:latestPrice2} =await getTickerLiquidity(signalNegativeTicker)
        
        //setting long and short ticker based on zScore sign
        if(signalPositive){
            longTicker = signalPositiveTicker
            shortTicker = signalNegativeTicker
            avgliguidityLong = avgqty1;
            avgliguidityShort = avgqty2;
            latestPriceLong = latestPrice1
            latestPriceShort = latestPrice2
        }else{
            longTicker = signalNegativeTicker
            shortTicker = signalPositiveTicker
            avgliguidityLong = avgqty2;
            avgliguidityShort = avgqty1;
            latestPriceLong = latestPrice2
            latestPriceShort = latestPrice1
        }


        const capitalLong = capital * 0.5
        const capitalShort = capital - capitalLong
        const initialFillLong = avgliguidityLong * latestPriceLong
        const initialFillShort = avgliguidityShort * latestPriceShort
       // let initialTradeCapitalInjection = Math.min(initialFillLong,initialFillShort)
        let initialTradeCapitalInjection = 500
             
        if(initialTradeCapitalInjection>capitalLong){
            initialTradeCapital = capitalLong
        }else{
            initialTradeCapital = initialTradeCapitalInjection
        }

        let remainingCapitalLong = capitalLong;
        let remainingCapitalShort = capitalShort;
        let longOrderId
        let shortOrderId

        let orderStatusLong = ''
        let orderStatusShort = ''
        let countLong = 0
        let countShort = 0
        //continue to trade until trade is complete 
        while(killSwitch === 0){
            if(countLong === 0){
                //calls initializeOrder() to execute long trade
                const [longOrder] = await Promise.all([initializeOrder(longTicker,'Long',initialTradeCapitalInjection)])
                
                if(longOrder.order){
                    countLong = 1
                }else{
                    countLong = 0
                }
                longOrderId = longOrder.order
                console.log('Long order id',longOrderId)
            }
            
            remainingCapitalLong = remainingCapitalLong-initialTradeCapitalInjection 
            
            if(countShort === 0){
                //calls initializeOrder() to execute short trade
                const [shortOrder] = await Promise.all([initializeOrder1(shortTicker,'Short',initialTradeCapitalInjection)])                
                if(shortOrder.order){
                    countShort = 1
                }else{
                    countShort = 0
                }
                shortOrderId = shortOrder.order
                console.log('Short order id',shortOrderId)
            }
            
            remainingCapitalShort = remainingCapitalShort-initialTradeCapitalInjection

            if(latestZscore > 0){
                signalSide = 'positive'
            }else{
                signalSide = 'negative'
            }

            /*if(countShort ===1 && countLong ===1){
                console.log('killing')
                killSwitch = 1
            }*/
            //calls getLatestZscore() to check if its still above threshold
            let {latestZscore:updateZscore,signalPositive:signalPositiveUpdate} = await getLatestZscore();
            latestZscore = updateZscore
            console.log('latest zScore',latestZscore)
            if(killSwitch === 0){
                if(Math.abs(updateZscore)> 0.9 * signalTrigger && signalPositiveUpdate ===signalPositive ){
                    if(countLong=== 1){
                        orderStatusLong = await reviewOrder(longTicker,longOrderId,remainingCapitalLong,'Long')
                        console.log('Long',orderStatusLong)
                    }
                    if(countShort=== 1){
                        orderStatusShort = await reviewOrder(shortTicker,shortOrderId,remainingCapitalShort,'Short')
                        console.log('Short',orderStatusShort)
                    }
                    //check if order is still in process
                    if(orderStatusLong === "Order Active" || orderStatusShort === "Order Active") continue
                    if(orderStatusLong === "Partial Fill" || orderStatusShort === "Partial Fill") continue
                    //check if trade is complete and set kill swicth
                    //to 1 to exit while loop
                    if(orderStatusLong === "Trade Complete" && orderStatusShort === "Trade Complete"){
                        killSwitch = 1
                    }
                    if(orderStatusLong === "Position Filled" || orderStatusShort === "Position Filled"){
                        countLong = 0
                        countShort = 0
                    }

                    //if order failed set count to 0 to try and place again
                    if (orderStatusLong === 'Try Again'){
                        countLong = 0
                    }
                    if (orderStatusShort=== 'Try Again'){
                        countShort = 0
                    }
                    
                }else{
                    //if zScore not above threshold stop placing trades 
                    await client.cancelAllActiveOrders(signalPositiveTicker)
                    await client.cancelAllActiveOrders(signalNegativeTicker)
                    killSwitch = 1
                }
            }
        }
        
    }
    // check if zScore and sign still match if not set killSwitch to 2
    if(killSwitch === 1){
        if (signalSide === 'positive' && latestZscore < 0){
            killSwitch = 2
        }
        if(signalPositiveTicker === 'negative' && latestZscore >= 0){
            killSwitch = 2
        }
    }
    
    resolve(killSwitch)
});
}

module.exports = {manageNewTrade}

