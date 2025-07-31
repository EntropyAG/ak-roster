/**
 * Evaluate the player's roster to see whether it's viable to run PI/SR.
 * @param {Array[Operator]} operators: list of operators owned by the player, as imported
 * @param {Base} base: the base setup of the player
 * @returns {Object}: with "rosmonPD" and "ebenPD" and their respective productivity
 * given the other operators
 */
const evalMonsterHunter = (roster) => {
    let isYatoAlterUsed = false;
    let isNoirCorneAlterUsed = false;
    let isTRCUsed = false;
    let isVermeilUsed = false;
    let trcFacPD = 0;
    let trcTPPD = 0;

    let yatoAlter = roster["char_1029_yato2"];
    let noirCorneAlter = roster["char_1030_noirc2"];
    let trc = roster["char_4077_palico"];
    let vermeil = roster["char_190_clour"];

    if(yatoAlter){
        isYatoAlterUsed = true;
    }

    if(noirCorneAlter){
        isNoirCorneAlterUsed = true;
    }

    // ========== TRC productivity ===========

    if(trc){
        trcFacPD = 5;
        trcTPPD = 5;
        isTRCUsed = true;

        if(isYatoAlterUsed){
            trcFacPD += 8;
            trcTPPD += 24;
        }

        if(isNoirCorneAlterUsed){
            trcFacPD += 4;
            trcTPPD += 12;
        }

        if(vermeil){
            isVermeilUsed = true;
            trcFacPD += 16;
        }
    }

    let bothYatoAndNoirCorneE2 = yatoAlter && yatoAlter.elite === 2
        && noirCorneAlter && noirCorneAlter.elite === 2;

    return {
        "isYatoAlterUsed": isYatoAlterUsed,
        "isNoirCorneAlterUsed": isNoirCorneAlterUsed,
        "isTRCUsed": isTRCUsed,
        "isVermeilUsed": isVermeilUsed,
        "facPD": trcFacPD,
        "tpPD": trcTPPD,
        "hasFacBuff": bothYatoAndNoirCorneE2,
        "hasTPBuff": bothYatoAndNoirCorneE2
    };
};

export default evalMonsterHunter;