import { tpOrders, tpDailyLmd } from "../../../src/data/riic/tpOrders.ts";
import { roundTo } from "../../../src/util/fns/mathUtils.ts";

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
        goldLineCount: 0,
        totalPD: 0
    };

    let pozyomka = roster["char_4055_bgsnow"];
    let tuye = roster["char_402_tuye"];
    let kirara = roster["char_478_kirara"];

    base.getGoldLineCount();

    return results;
};

export default evalPozyGLP;