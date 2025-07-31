import cnCharacterTable from "../../ArknightsGameData/zh_CN/gamedata/excel/character_table.json";

import { tpOrders, tpDailyLmd } from "../../../src/data/riic/tpOrders.ts";
import roundTo from "../../../src/util/fns/mathUtils.ts";

/**
 * Evaluate the player's roster to see whether it's viable to run PI/SR.
 * @param {Array[Operator]} operators: list of operators owned by the player, as imported
 * @param {Base} base: the base setup of the player
 * @returns {Object}: with "rosmonPD" and "ebenPD" and their respective productivity
 * given the other operators
 */
const evalShamare = (roster) => {
    let results = {
        shamareElite: -1,
        tequilaElite: -1,
        bibeakElite: -1,
        kafkaElite: -1,
        paprikaElite: -1,
        diamanteElite: -1,
        equivalentTpPd: 0,
        alpha: 0,
        beta: 0
    };

    let shamare = roster["char_254_vodfox"];
    // The team is subpar without E2 Shamare, so just force quit if the player doesn't have her
    if(!shamare || (shamare && shamare.elite !== 2)){
        return results;
    }
    results.shamareElite = shamare.elite;

    let tequila = roster["char_486_takila"];
    let bibeak = roster["char_252_bibeak"];
    let kafka = roster["char_214_kafka"];
    let paprika = roster["char_4071_peper"];
    let diamante = roster["char_499_kaitou"];

    // First, check what tier of gold bar value we'll be using depending on Tequila
    let barValueDefault = tpOrders.goldValues[0];
    let barValueTequila = tpOrders.goldValues[0];
    if(tequila){
        results.tequilaElite = tequila.elite;
        barValueTequila = tpOrders.goldValues[1];
        if(tequila.elite === 2){
            barValueTequila = tpOrders.goldValues[2];
        }
    }

    // Second, find the best Tailoring operator
    results.alpha = 1; // We start at one, because Shamare has it on her E0
    results.beta = 0;
    for(let operator of [bibeak, kafka, paprika, diamante]){
        if(!operator){
            continue;
        }
        let appellation = cnCharacterTable[operator.op_id].appellation.toLocaleLowerCase();
        results[appellation+"Elite"] = operator.elite;
        if(operator.elite === 2){
            results.beta++;
        }else{
            results.alpha++;
        }
    }

    // ============= Calculating PD =============
    // Get the weighted value of LMD produced for 4-bars orders
    let weights = tpOrders.weights[1];
    if(results.beta >= 0){
        weights = tpOrders.weights[3];
    }else if(results.alpha >= 2){
        weights = tpOrders.weights[2];
    }

    let weightedLMDValue =
      weights[0] * barValueDefault * 2
    + weights[1] * barValueDefault * 3
    + weights[2] * barValueTequila * 4;

    // Get the weighted time
    let squadPD = 1.93; // 90% due to Shamare + 3% from innate PD due to operators slotted
    let times = tpOrders.time;
    let weightedTime =
        weights[0] * times[2] / squadPD
      + weights[1] * times[3] / squadPD
      + weights[2] * times[4] / squadPD;

    // Divide both for estimated PD (TP3 as a baseline)
    let lmdPerDay = weightedLMDValue / weightedTime * 24 * 60;
    results.equivalentTpPd = roundTo((lmdPerDay / tpDailyLmd[2] - 1) * 100, 2);
    return results;
};

export default evalShamare;