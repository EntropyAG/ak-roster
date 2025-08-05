import { getFactoryStats } from "../evalHelpers.mjs";
import { combinations } from "util/fns/mathUtils.ts";

/**
 * Evaluate the player's roster to see the best partners for a given core operator.
 * Used in particular for both Vermeil and Bubble
 */
const evalCoreOperatorFac = (roster, base, coreOperatorId, teamCandidates, minimumPromotion) => {
    let coreOperator = roster[coreOperatorId];
    if(!coreOperator || (coreOperator && coreOperator.elite < minimumPromotion)){
        return {
            "operatorId": coreOperatorId,
            "isOperatorUsed": false
        };
    }
    // Retrieve all the listed operators, remove those who aren't found to save up on calcs
    let operatorsToTest = Object.values(roster).filter(
        e => teamCandidates.indexOf(e.op_id) !== -1
    );
    // We build squads of 2, since the core operator is always present
    let squads = combinations(operatorsToTest, 2);
    let bestPerformingExp;
    let bestPerformingGold;
    for(let squad of squads){
        squad.push(coreOperator);
        let results = getFactoryStats(squad, base);
        // Replacing EXP squad if current is better
        if(!bestPerformingExp || results.totalExpProductivity > bestPerformingExp.totalExpProductivity){
            bestPerformingExp = results;
        }
        // Replacing Gold squad if current is better
        if(!bestPerformingGold || results.totalGoldProductivity > bestPerformingGold.totalGoldProductivity){
            bestPerformingGold = results;
        }
    }
    return {
        "operatorId": coreOperatorId,
        "isOperatorUsed": true,
        "squadExp": bestPerformingExp,
        "squadGold": bestPerformingGold
    };
};

export default evalCoreOperatorFac;