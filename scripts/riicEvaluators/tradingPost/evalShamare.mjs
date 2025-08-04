import operators from "data/operators.json";
import { roundTo } from "util/fns/mathUtils.ts";

import { tpOrders, tpDailyLmd } from "data/riic/tpOrders.ts";

// 2 (200%) = base TP PD (100%) + Shamare (90%) + CC buff (7%) + innate (3%)
const SHAM_FULL_TP_PD = 2;
// Shamare provides 2 * 45% productivity in a lvl 3 TP
const SHAM_CONTRIB = 0.9;

const MN_PER_DAY = 60 * 24;
// 1 gold bar = 72mn to craft, so 60 * 24 / 72 = 20 gold bars crafted at default (100%) PD
const BASELINE_FAC_GOLD_PER_DAY = 20;

/**
 * Evaluate the player's roster to see whether it's viable to run a Shamare squad.
 * The squad relies on Shamare for the raw productivity (90%), Tequila to improve the value
 * of 4-bars orders and Tailoring alpha/beta to increase the frequency at which said 4-bars
 * orders show up.
 * @param {Roster} roster: all operators owned by the player.
 * @returns {Object}: listing operators used, their promotion level and expected productivity
 * for the TP as well as the expected saved productivity from Tequila's skills.
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
        equivalentFacPd: 0,
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
        let appellation = operators[operator.op_id].name.toLocaleLowerCase();
        results[appellation+"Elite"] = operator.elite;
        if(operator.elite === 2){
            results.beta++;
        }else{
            results.alpha++;
        }
    }

    // ============= Calculating Trading post PD =============
    // Get the weighted value of LMD produced for 4-bars orders
    let weights = tpOrders.tp3weights[1];
    if(results.beta >= 1){
        weights = tpOrders.tp3weights[3];
    }else if(results.alpha >= 2){
        weights = tpOrders.tp3weights[2];
    }

    let weightedLMDValue =
        weights[0] * barValueDefault * 2
      + weights[1] * barValueDefault * 3
      + weights[2] * barValueTequila * 4;

    let weightedTime =
        weights[0] * tpOrders.time[2]
      + weights[1] * tpOrders.time[3]
      + weights[2] * tpOrders.time[4];

    // Divide both for estimated PD (TP3 as a baseline)
    let lmdPerDay = weightedLMDValue * MN_PER_DAY / weightedTime;
    let pdGainOverBaseline = lmdPerDay / tpDailyLmd[2];
    results.equivalentTpPd = roundTo(
            (pdGainOverBaseline * SHAM_FULL_TP_PD - SHAM_FULL_TP_PD + SHAM_CONTRIB) * 100
            , 2
        )
    ;

    // ============= Calculating saved FAC PD =============
    /**
     * Explanation: Tequila increases the weighted average value of gold bars due to his base skill.
     * In effect, if you are getting 10000 LMD a day from a TP, you'll need 20 gold bars by default,
     * but with Tequila, you will get more LMD than that (say, 12000 for the sake of simplicity) while
     * still needing only 20 gold bars. In effect, this means you don't need as much productivity from
     * your FAC to keep up with an identical amount of LMD.
     *
     * This is especially important, because for a lvl 3 TP using a full E2 team with Shamare, Tequila
     * and Tailoring Beta and assuming Amiya is in CC, you are saving about 46% productivity from a gold
     * FAC. This is why the Shamare team almost always wins compared to others.
     *
     * You can check the following spreadsheet for the full calculations and use cases:
     * https://docs.google.com/spreadsheets/d/10MLzrR2dTumC8edx2X6lN36L5n701jVeRpEqww89chM
     */

    // Tequila provides extra LMD value only on 4-bar orders, hence 2/3-bars orders can be ignored.
    // The added value is either 250 LMD (0.5 bar) or 500 LMD (1 bar)
    if(tequila){
        let weightedExtraBarsPerOrder = weights[2] * (tequila.elite === 2 ? 1 : 0.5);
        let weightedGoldBonus = weightedExtraBarsPerOrder * MN_PER_DAY / weightedTime / BASELINE_FAC_GOLD_PER_DAY;
        let goldContribution = weightedGoldBonus * SHAM_FULL_TP_PD;
        results.equivalentFacPd = roundTo(goldContribution * 100, 2);
    }
    return results;
};

export default evalShamare;