const { signalPositiveTicker, signalNegativeTicker } = require("./botInfo");
const { checkOpenPositions, checkActiveOrder } = require("./checkPositions");
const { closeAllPositions } = require("./closePosition");
const { settingLeverage } = require("./execution");
const { manageNewTrade } = require("./tradeManagement");



const signalSignPositive = false
let killSwitch = 0
let startNewTrade

// setting leverages for both tickers
settingLeverage(signalPositiveTicker);
settingLeverage(signalNegativeTicker)

let kill = 1
while(kill ===1){
    //using setTimeout to run bot on an interval
    setTimeout(async() => {
        //check if previous positions are closed before starting new trade 
        checkPositiveTickerOpen = await checkOpenPositions(signalPositiveTicker);
        checkNegativeTickerOpen = await checkOpenPositions(signalNegativeTicker);
        checkPositiveTickerActive = await checkActiveOrder(signalPositiveTicker);
        checkNegativeTickerActive = await checkActiveOrder(signalNegativeTicker);
        

        //close positions if they are still open 
        if(!checkPositiveTickerOpen && !checkNegativeTickerOpen && !checkPositiveTickerActive && !checkNegativeTickerActive){
            startNewTrade = true
            killSwitch = 0
        }else {
            console.log('clossing')
            await closeAllPositions()
            killSwitch = 0
            startNewTrade = true

        }

        if (startNewTrade && killSwitch === 0){
            console.log('running')
            let kswitch = await manageNewTrade(killSwitch)
            killSwitch = kswitch
                       
        }

        if(killSwitch === 2){
            console.log('clossing')
            killSwitch = await closeAllPositions(killSwitch)
            setTimeout(() => {}, 5000)
        }
    }, 3000)
    kill = 3
}
