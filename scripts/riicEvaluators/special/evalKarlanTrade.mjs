import { getTradingPostStats } from "../evalHelpers.mjs";
import { combinations } from "util/fns/mathUtils.ts";

/**
 * Evaluate the player's roster to see whether it's viable to run PI/SR.
 * @param {Array[Operator]} operators: list of operators owned by the player, as imported
 * @param {Base} base: the base setup of the player
 * @returns {Object}: with "rosmonPD" and "ebenPD" and their respective productivity
 * given the other operators
 */
const evalKarlanTrade = (roster, base) => {
    let gnosis = roster["char_206_gnosis"];
    let swireAlt = roster["char_1033_swire2"];
    let silverAsh = roster["char_172_svrash"];
    let degenbrecher = roster["char_4116_blkkgt"];
    let cliffheart = roster["char_173_slchan"];
    let courier = roster["char_198_blackd"];
    let matterhorn = roster["char_199_yak"];
    let jaye = roster["char_272_strong"];

    let isGnosisUsed = false;
    if(gnosis && gnosis.elite === 2){
        isGnosisUsed = true;
    }

    let operatorsToTest = [
        swireAlt, silverAsh, degenbrecher, cliffheart, courier, matterhorn, jaye
    ].filter(e => e !== undefined);

    let squads = combinations(operatorsToTest, 3);
    let bestPerforming;
    for(let squad of squads){
        let results = getTradingPostStats(squad, base, isGnosisUsed);
        if(!bestPerforming || results.totalProductivity > bestPerforming.totalProductivity){
            bestPerforming = results;
        }
    }

    return {
        "isGnosisUsed": isGnosisUsed,
        "squad": bestPerforming
    };
};

export default evalKarlanTrade;