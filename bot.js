const { signalPositiveTicker, signalNegativeTicker } = require("./botInfo");
const { checkOpenPositions, checkActiveOrder } = require("./checkPositions");
const { closeAllPositions } = require("./closePosition");
const { settingLeverage } = require("./execution");
const { manageNewTrade } = require("./tradeManagement");



const signalSignPositive = false
let killSwitch = 0
let startNewTrade

settingLeverage(signalPositiveTicker);
settingLeverage(signalNegativeTicker)

let kill = 1
while(kill ===1){
    setTimeout(async() => {
        checkPositiveTickerOpen = await checkOpenPositions(signalPositiveTicker);
        checkNegativeTickerOpen = await checkOpenPositions(signalNegativeTicker);
        checkPositiveTickerActive = await checkActiveOrder(signalPositiveTicker);
        checkNegativeTickerActive = await checkActiveOrder(signalNegativeTicker);
        console.log(checkPositiveTickerOpen)
        console.log(checkPositiveTickerActive)
        console.log(checkNegativeTickerOpen)
        console.log(checkNegativeTickerActive)
        if(!checkPositiveTickerOpen && !checkNegativeTickerOpen && !checkPositiveTickerActive && !checkNegativeTickerActive){
            startNewTrade = true
        }else {
            console.log('clossing')
            await closeAllPositions()
            startNewTrade = true

        }

        if(!checkPositiveTickerOpen && !checkNegativeTickerOpen && !checkPositiveTickerActive && !checkNegativeTickerActive){
            startNewTrade = true
            killSwitch = 0
        }

        if (startNewTrade && killSwitch === 0){
            console.log('running')
            let kswitch = await manageNewTrade(killSwitch)
            killSwitch = kswitch
            console.log(kswitch)
            
        }

        if(killSwitch === 2){
            console.log('clossing')
            killSwitch = await closeAllPositions(killSwitch)
            setTimeout(() => {}, 5000)
        }
    }, 3000)
    kill = 3
}
