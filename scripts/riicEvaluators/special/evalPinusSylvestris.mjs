/**
 * Evaluate the player's roster to see whether it's viable to run PI/SR.
 * @param {Array[Operator]} operators: list of operators owned by the player, as imported
 * @param {Base} base: the base setup of the player
 * @returns {Object}: with "rosmonPD" and "ebenPD" and their respective productivity
 * given the other operators
 */
const evalPinusSylvestris = (roster) => {
    let isVivianaUsed = false;
    let isWildmaneUsed = false;
    let isAshlockUsed = false;
    let isFartoothUsed = false;
    let isGravelUsed = false;
    let isJusticeKnightUsed = false;
    let wildmanePDGold = 0;
    let ashlockPDGold = 0;
    let fartoothPDGold = 0;
    let gravelPDGold = 0;

    // ============== Gold evaluation part ==============

    // Vivi first, since she is an amplifier for everyone
    let viviana = roster["char_4098_vvana"];
    if (viviana && viviana.elite === 2) {
        isVivianaUsed = true;
    }

    // Now for all FAC candidates
    let wildmane = roster["char_496_wildmn"];
    if (wildmane) {
        isWildmaneUsed = true;
        wildmanePDGold = 15;
        if (wildmane.elite === 2) {
            wildmanePDGold = 25;
        }

        if(isVivianaUsed){
            wildmanePDGold += 7;
        }

        let justiceKnight = roster["char_4000_jnight"];
        if(justiceKnight){
            isJusticeKnightUsed = true;
            wildmanePDGold += 5;
        }
    }

    let ashlock = roster["char_431_ashlok"];
    if (ashlock) {
        isAshlockUsed = true;
        ashlockPDGold = 15;
        if (ashlock.elite === 2) {
            ashlockPDGold = 25;
        }

        if(isVivianaUsed){
            ashlockPDGold += 7;
        }
    }

    let fartooth = roster["char_430_fartth"];
    if (fartooth) {
        isFartoothUsed = true;
        fartoothPDGold = 15;
        if (fartooth.elite === 2) {
            fartoothPDGold = 25;
        }

        if(isVivianaUsed){
            fartoothPDGold += 7;
        }
    }

    let gravel = roster["char_237_gravel"];
    if (gravel && (gravel.elite >= 1)) {
        isGravelUsed = true;
        gravelPDGold = 35;

        if(isVivianaUsed){
            gravelPDGold += 7;
        }
    }

    let goldScore = {
        "isVivianaUsed": isVivianaUsed,
        "isWildmaneUsed": isWildmaneUsed,
        "isGravelUsed": isGravelUsed,
        "isAshlockUsed": isAshlockUsed,
        "isFartoothUsed": isFartoothUsed,
        "isJusticeKnightUsed": isJusticeKnightUsed,
        "wildmanePDGold": wildmanePDGold,
        "ashlockPDGold": ashlockPDGold,
        "fartoothPDGold": fartoothPDGold,
        "gravelPDGold": gravelPDGold,
        "totalPD": wildmanePDGold + ashlockPDGold + fartoothPDGold + gravelPDGold
    };

    // ============== EXP evaluation part ==============
    let isFlametailUsed = false;
    let flametail = roster["char_420_flamtl"];
    let wildmanePDEXP = wildmanePDGold;
    let ashlockPDEXP = ashlockPDGold;
    let fartoothPDEXP = fartoothPDGold;
    if (flametail && flametail.elite === 2) {
        isFlametailUsed = true;
        wildmanePDEXP = isWildmaneUsed ? wildmanePDGold + 10 : 0;
        ashlockPDEXP = isAshlockUsed ? ashlockPDGold + 10 : 0;
        fartoothPDEXP = isFartoothUsed ? fartoothPDGold + 10 : 0;
    }

    // Adjusting Gravel's prod if Flametail is being used.
    // For later calculations regarding rotations, Gravel will preferably be put on an async rotation
    // with only Vivi in CC or just used without Vivi/Flametail at all, for, e.g, a Bryophita metalwork team
    let gravelPDFlametail = gravelPDGold;
    if(isFlametailUsed && isGravelUsed){
        gravelPDFlametail -= 10;
    }

    let expScore = {
        "isFlametailUsed": isFlametailUsed,
        "isVivianaUsed": isVivianaUsed,
        "isWildmaneUsed": isWildmaneUsed,
        "isGravelUsed": isGravelUsed,
        "isAshlockUsed": isAshlockUsed,
        "isFartoothUsed": isFartoothUsed,
        "isJusticeKnightUsed": isJusticeKnightUsed,
        "wildmanePDEXP": wildmanePDEXP,
        "ashlockPDEXP": ashlockPDEXP,
        "fartoothPDEXP": fartoothPDEXP,
        "gravelPDGold": gravelPDFlametail,
        "totalPD": wildmanePDEXP + ashlockPDEXP + fartoothPDEXP + gravelPDFlametail
    };

    return {
        "exp": expScore,
        "gold": goldScore
    };
};

export default evalPinusSylvestris;