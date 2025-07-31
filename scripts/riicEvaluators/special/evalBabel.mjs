/**
 * Evaluate the player's roster to see whether it's viable to run PI/SR.
 * @param {Array[Operator]} operators: list of operators owned by the player, as imported
 * @param {Base} base: the base setup of the player
 * @returns {Object}: with "rosmonPD" and "ebenPD" and their respective productivity
 * given the other operators
 */
const evalBabel = (roster) => {
    let isCEUsed = false;
    let isWisadelUsed = false;
    let isInesUsed = false;
    let isHoedererUsed = false;
    let isWUsed = false;
    let hoedererPD = 0;
    let hoedererCapTP = 0;
    let wisadelInesBuffRR = 0;
    let inesSpeedRR = 0;
    let ceBuffRR = 0;
    let mdDrainGlobal = 0;

    // We don't need to check for Amiya, since everyone has her and she only needs E0
    let ce = roster["char_4134_cetsyr"];
    let wisadel = roster["char_1035_wisdel"];
    let ines = roster["char_4087_ines"];
    let hoederer = roster["char_4088_hodrer"];
    let w = roster["char_113_cqbw"];

    if(ce && ce.elite === 2){
        isCEUsed = true;
        ceBuffRR += 15;
    }

    if(wisadel){
        isWisadelUsed = true;
        wisadelInesBuffRR += 5;
        hoedererCapTP = 1;
        if(wisadel.elite === 2){
            mdDrainGlobal = 0.1;
            hoedererCapTP = 2;
            if(isCEUsed){
                mdDrainGlobal = 0.2;
            }
        }
    }

    if(ines){
        isInesUsed = true;
        // 5% innate + 20% skill + 5% rarity bonus + 16% elite2 + external buffs
        inesSpeedRR = 30 + ceBuffRR + wisadelInesBuffRR;
        if(ines.elite === 2){
            inesSpeedRR += 16;
        }
    }

    if(w){
        isWUsed = true;
    }

    if(hoederer){
        isHoedererUsed = true;
        hoedererPD = 25;
        if(isInesUsed){
            hoedererPD += 5;
        }

        if(hoederer.elite === 2){
            hoedererPD += 5;
            if(isWUsed){
                hoedererPD += 5;
            }
        }

    }

    return {
        "isCEUsed": isCEUsed,
        "isWisadelUsed": isWisadelUsed,
        "isInesUsed": isInesUsed,
        "isHoedererUsed": isHoedererUsed,
        "isWUsed": isWUsed,
        "hoedererPD": hoedererPD,
        "hoedererCapTP": hoedererCapTP,
        "wisadelInesBuffRR": wisadelInesBuffRR,
        "inesSpeedRR": inesSpeedRR,
        "ceBuffRR": ceBuffRR,
        "mdDrainGlobal": mdDrainGlobal
    };
};

export default evalBabel;