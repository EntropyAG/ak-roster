import { checkOperatorCount } from "../evalHelpers.mjs";

/**
 * Evaluate the player's roster to see whether it's viable to run PI/SR.
 * @param {Array[Operator]} operators: list of operators owned by the player, as imported
 * @param {Base} base: the base setup of the player
 * @returns {Object}: with "rosmonPD" and "ebenPD" and their respective productivity
 * given the other operators
 */
const evalAbyssalHunters = (roster) => {
    let isGladiiaUsed = false;
    let isSkadiUsed = false;
    let isSpecterUsed = false;
    let isUlpianusUsed = false;
    let isAndreanaUsed = false;
    let isUnderflowUsed = false;
    let ahPD = 0;
    let underflowPD = 0;

    let gladiia = roster["char_474_glady"];
    let skadi = roster["char_263_skadi"];
    let specter = roster["char_143_ghost"];
    let ulpianus = roster["char_4145_ulpia"];
    let andreana = roster["char_218_cuttle"];
    let underflow = roster["char_4137_udflow"];

    if(underflow){
        isUnderflowUsed = true;
        if(underflow.elite === 2){
            underflowPD = 30;
            if(ulpianus){
                isUlpianusUsed = true;
                underflowPD += 10;
            }
        }else{
            underflowPD = 25;
            if(ulpianus){
                underflowPD += 5;
                isUlpianusUsed = true;
            }
        }
    }

    if(gladiia){
        isGladiiaUsed = true;
        if(skadi){
            isSkadiUsed = true;
        }
        if(specter){
            isSpecterUsed = true;
        }
        if(andreana){
            isAndreanaUsed = true;
        }
        if(ulpianus){
            isUlpianusUsed = true;
        }

        let abyssalHunterFacCount = checkOperatorCount(isSkadiUsed, isSpecterUsed, isAndreanaUsed, isUlpianusUsed);
        ahPD = abyssalHunterFacCount * 5;
        if(gladiia.elite === 2){
            ahPD *= 2;
        }
    }

    return {
        "isGladiiaUsed": isGladiiaUsed,
        "isSkadiUsed": isSkadiUsed,
        "isSpecterUsed": isSpecterUsed,
        "isUlpianusUsed": isUlpianusUsed,
        "isAndreanaUsed": isAndreanaUsed,
        "isUnderflowUsed": isUnderflowUsed,
        "ahPD": ahPD,
        "underflowPD": underflowPD
    };
};

export default evalAbyssalHunters;