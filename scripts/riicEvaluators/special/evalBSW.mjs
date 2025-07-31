/**
 * Evaluate the player's roster to see whether it's viable to run PI/SR.
 * @param {Array[Operator]} operators: list of operators owned by the player, as imported
 * @param {Base} base: the base setup of the player
 * @returns {Object}: with "rosmonPD" and "ebenPD" and their respective productivity
 * given the other operators
 */
const evalBSW = (roster) => {
    let isJessicaAltUsed = false;
    let isMizukiUsed = false;
    let isAlmondUsed = false;
    let almondPD = 0;
    let jessicaAndVanillaPD = 25;
    let mizukiPD = 0;

    let jessicaAlt = roster["char_1034_jesca2"];
    let mizuki = roster["char_437_mizuki"];
    let almond = roster["char_4105_almond"];

    // There is no need to check for Vanilla and OG Jessica, no way people don't have them
    if(jessicaAlt && jessicaAlt.elite === 2){
        isJessicaAltUsed = true;
        jessicaAndVanillaPD += 5;
    }

    if(mizuki && mizuki.elite === 2){
        isMizukiUsed = true;
        mizukiPD = 40; // 25 from E2 + 3*5 from E0 and having 2 other standard skills
    }

    if(almond){
        isAlmondUsed = true;
        almondPD = 25;
        if(isJessicaAltUsed){
            almondPD += 5;
        }
        if(almond.elite === 2){
            // 2% for each BSW operators in base, including Almond, excluding Jessica alt, 3x cap
            almondPD += 6;
        }
    }

    return {
        "isJessicaAltUsed": isJessicaAltUsed,
        "isMizukiUsed": isMizukiUsed,
        "isAlmondUsed": isAlmondUsed,
        "almondPD": almondPD,
        "jessicaAndVanillaPD": jessicaAndVanillaPD * 2,
        "mizukiPD": mizukiPD,
        "totalJessVaniMizuAlmondPD": almondPD + jessicaAndVanillaPD * 2 + mizukiPD, // lvl 3 FAC + single Gold
        "totalJessVaniAlmondPD": almondPD + jessicaAndVanillaPD * 2 // Single lvl 3 FAC
    };
};

export default evalBSW;