/**
 * Evaluate the player's roster to see whether it's viable to run PI/SR.
 * @param {Array[Operator]} operators: list of operators owned by the player, as imported
 * @param {Base} base: the base setup of the player
 * @returns {Object}: with "rosmonPD" and "ebenPD" and their respective productivity
 * given the other operators
 */
const evalAutomation = (roster, base) => {
    let ppCount = base.getPowerPlantCount();
        let isLancetDead = false;
        let isLancetUsed = false;
        let isGreyyaltUsed = false;
        let isEunectesUsed = false;
        let isWeedyUsed = false;
        let isPassengerUsed = false;
        let isPurestreamUsed = false;
        let isWindflitUsed = false;
        let weedyPD = 0;
        let passengerPD = 0;
        let windflitPD = 0;
        let purestreamPD = 0;

        // First, we check for virtual power plants with Greyy alter/Zumama since they influence the other ops
        let greyyalt = roster["char_1027_greyy2"];
        if (greyyalt && greyyalt.elite === 2) {
            ppCount += 1;
            isLancetDead = true;
            isGreyyaltUsed = true;
        }

        let eunectes = roster["char_416_zumama"];
        if (eunectes && eunectes.elite === 2) {
            ppCount += 2;
            isEunectesUsed = true;
            isLancetUsed = true;
        }

        // Now to cover all the automation skills
        let weedy = roster["char_400_weedy"];
        if (weedy) {
            isWeedyUsed = true;
            weedyPD = ppCount * 10;
            if (weedy.elite === 2) {
                weedyPD = ppCount * 15;
            }
        }

        let purestream = roster["char_385_finlpp"];
        if (purestream && purestream.elite >= 1) {
            isPurestreamUsed = true;
            purestreamPD = base.getTradingPostCount() * 20;
        }

        // Returns on Passenger & Windflit are too low with PP, with a measly 20% at full potential
        if (base.getPowerPlantCount() === 3) {
            let passenger = roster["char_472_pasngr"];
            if (passenger && passenger.elite === 2) {
                isPassengerUsed = true;
                passengerPD = ppCount * 5;
            }

            // We only add Windflit if passenger is not used, due to the 3 slot limitation
            let windflit = roster["char_433_windft"];
            if (!isPassengerUsed && windflit && windflit.elite === 2) {
                isWindflitUsed = true;
                windflitPD = ppCount * 5;
            }
        }

        return {
            "isGreyyaltUsed": isGreyyaltUsed,
            "isWindflitUsed": isWindflitUsed,
            "isPassengerUsed": isPassengerUsed,
            "isEunectesUsed": isEunectesUsed,
            "isWeedyUsed": isWeedyUsed,
            "isLancetUsed": isLancetUsed,
            "isLancetDead": isLancetDead,
            "isPurestreamUsed": isPurestreamUsed,
            "weedyPD": weedyPD,
            "passengerPD": passengerPD,
            "windflitPD": windflitPD,
            "purestreamPD": purestreamPD,
            "totalPD": weedyPD + passengerPD + windflitPD + purestreamPD
        };
};

export default evalAutomation;