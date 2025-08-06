import { getTradingPostStats } from "../evalHelpers.mjs";
import { combinations } from "util/fns/mathUtils.ts";

/**
 * Evaluate the player's roster to see the best partners for a given core operator.
 * Used in particular for jaye
 */
const evalCoreOperatorTp = (
    roster,
    base,
    flags,
    coreOperatorId,
    teamCandidates,
    minimumPromotion = 0,
    forceElite = -1
) => {
    let coreOperator = roster[coreOperatorId];
    if(!coreOperator || (coreOperator && coreOperator.elite < minimumPromotion && forceElite === -1)){
        return {
            "operatorId": coreOperatorId,
            "isOperatorUsed": false
        };
    }

    let actualPromotion = coreOperator.elite;
    if(forceElite !== -1){
        coreOperator.elite = forceElite;
    }

    // Retrieve all the listed operators, remove those who aren't found to save up on calcs
    let operatorsToTest = Object.values(roster).filter(
        e => teamCandidates.indexOf(e.op_id) !== -1
    );
    // We build squads of 2, since the core operator is always present
    let squads = combinations(operatorsToTest, 2);
    let bestPerforming;
    for(let squad of squads){
        squad.push(coreOperator);
        let results = getTradingPostStats(squad, base, flags);
        if(!bestPerforming || results.totalProductivity > bestPerforming.totalProductivity){
            bestPerforming = results;
        }
    }
    // Reverting back to real promotion level if it has been forced
    coreOperator.elite = actualPromotion;
    return {
        "operatorId": coreOperatorId,
        "isOperatorUsed": true,
        "squad": bestPerforming,
    };
};

export default evalCoreOperatorTp;