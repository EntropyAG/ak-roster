import { checkOperatorCount } from "../evalHelpers.mjs";

/**
 * Evaluate the player's roster to see whether it's viable to run PI/SR.
 * @param {Array[Operator]} operators: list of operators owned by the player, as imported
 * @param {Base} base: the base setup of the player
 * @returns {Object}: with "rosmonPD" and "ebenPD" and their respective productivity
 * given the other operators
 */
const evalPozyGLP = (roster, base) => {
    let results = {
        pozyElite: -1,
        kiraraElite: -1,
        tuyeElite: -1,
        isDurinUsed: false,
        isTecnoUsed: false,
        isMyrtleUsed: false,
        isChestnutUsed: false,
        isMinimalistUsed: false,
        durinCount: 0,
        goldLineCount: 0,
        tuyePD: 0,
        pozyPD: 0,
        kiraraPD: 0,
        totalPD: 0
    };

    let pozyomka = roster["char_4055_bgsnow"];
    let tuye = roster["char_402_tuye"];
    let kirara = roster["char_478_kirara"];

    if(pozyomka) results.pozyElite = pozyomka.elite;
    if(tuye) results.tuyeElite = tuye.elite;
    if(kirara) results.kiraraElite = kirara.elite;

    let durin = roster["char_501_durin"];
    let tecno = roster["char_4164_tecno"];
    let myrtle = roster["char_151_myrtle"];
    let chestnut = roster["char_4041_chnut"];
    let minimalist = roster["char_4054_malist"];

    if(durin) results.isDurinUsed = true;
    if(tecno) results.isTecnoUsed = true;
    if(myrtle) results.isMyrtleUsed = true;
    if(chestnut) results.isChestnutUsed = true;
    if(minimalist) results.isMinimalistUsed = true;

    results.durinCount = checkOperatorCount(durin, tecno, myrtle, chestnut, minimalist);

    // [1] Calculate how many gold production lines we have

    results.goldLineCount += base.getGoldLineCount();
    // Kirara provides 2 lines per 2 existing ones at E2, otherwise 2 per 4 existing ones
    if(kirara?.elite === 2){
        results.goldLineCount += Math.floor(base.getGoldLineCount() / 2) * 2;
    }else if(kirara){
        results.goldLineCount += Math.floor(base.getGoldLineCount() / 4) * 2;
    }

    // Pozyomka can provide 1 extra GL per durin in base, up to 4.
    // Note that this is after Kirara's skill, as Pozy's extra GLP don't benefit Kirara
    if(pozyomka?.elite === 2){
        results.goldLineCount += Math.min(results.durinCount, 4);
    }

    // [2] Calculate productivity provided based on said gold lines

    if(kirara){
        results.kiraraPD += 5;
    }

    if(tuye?.elite === 2){
        results.tuyePD += 5 + Math.floor(results.goldLineCount / 2) * 15;
    }else if(tuye){
        results.tuyePD += 5 + Math.floor(results.goldLineCount / 4) * 15;
    }

    if(pozyomka){
        results.pozyPD += 5 * results.goldLineCount;
    }

    results.totalPD += results.kiraraPD + results.tuyePD + results.pozyPD;
    return results;
};

export default evalPozyGLP;