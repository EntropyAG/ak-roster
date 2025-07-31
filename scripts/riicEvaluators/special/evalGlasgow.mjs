/**
 * Evaluate the player's roster to see whether it's viable to run PI/SR.
 * @param {Array[Operator]} operators: list of operators owned by the player, as imported
 * @param {Base} base: the base setup of the player
 * @returns {Object}: with "rosmonPD" and "ebenPD" and their respective productivity
 * given the other operators
 */
const evalGlasgow = (roster) => {
    // Morgan is the reason this squad is valid in the first place, hence why the early quit if she isn't built
    let morgan = roster["char_154_morgan"];
    if(!morgan || morgan.elite !== 2){
        return {
            "isMorganUsed": false,
            "isDelphineUsed": false,
            "isSiegeUsed": false,
            "isVinaUsed": false,
            "isIndraUsed": false,
            "isDagdaUsed": false,
            "totalPRD": 0
        };
    }

    let isMorganUsed = true;
    let isDelphineUsed = false;
    let isSiegeUsed = false;
    let isVinaUsed = false;
    let isIndraUsed = false;
    let isDagdaUsed = false;
    let totalPRD = 20; // Default for Morgan herself
    let delphine = roster["char_4110_delphn"];
    if(delphine && delphine.elite === 2){
        isDelphineUsed = true;
    }

    let siege = roster["char_112_siege"];
    if(siege){
        isSiegeUsed = true;
        totalPRD += 35;
    }

    // Vina isn't considered Glasgow, so she doesn't benefit from Morgan's 20%
    let vina = roster["char_1019_siege2"];
    if(vina){
        isVinaUsed = true;
        if(vina.elite === 2){
            totalPRD += 40;
        }else{
            totalPRD += 30;
        }
    }

    let currCount = this.__checkOperatorCount(isMorganUsed, isSiegeUsed, isIndraUsed, isDagdaUsed);
    if(currCount < 3){
        // Indra check
        let indra = roster["char_155_tiger"];
        if(indra){
            isIndraUsed = true;
            totalPRD += 20;
        }

        // Dagda check
        currCount = this.__checkOperatorCount(isMorganUsed, isSiegeUsed, isIndraUsed, isDagdaUsed);
        if(currCount < 3){
            let dagda = roster["char_157_dagda"];
            if(dagda){
                isDagdaUsed = true;
                totalPRD += 20;
            }
        }
    }

    if(isDelphineUsed){
        totalPRD +=  Math.min(currCount, 3) * 10;
    }

    return {
        "isMorganUsed": isMorganUsed,
        "isDelphineUsed": isDelphineUsed,
        "isSiegeUsed": isSiegeUsed,
        "isVinaUsed": isVinaUsed,
        "isIndraUsed": isIndraUsed,
        "isDagdaUsed": isDagdaUsed,
        "totalPRD": totalPRD
    };
};

export default evalGlasgow;