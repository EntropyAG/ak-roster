import { getTradingPostStats, composeSquadsOf2 } from "../evalHelpers.mjs";

import { tpOperators } from "../../../src/data/riic/operators.ts";

/**
 * Returns a list of TP operators with all their productivity
 */
const evalTpPairs = (roster,  base) => {
    let opScores = [];
    // Retrieve all the listed operators, remove those who aren't found to save up on calcs
    let operatorsToTest = Object.values(roster).filter(
        e => tpOperators.indexOf(e.op_id) !== -1
    );
    // We build squads of 2, since the core operator is always present
    let squads = composeSquadsOf2(operatorsToTest);
    for(let squad of squads){
        let results = getTradingPostStats(squad, base);
        opScores.push({
            "operator1": results.operator1,
            "operator2": results.operator2,
            "pd": results.tpProductivity
        });
    }
    return opScores.sort((a, b) => b.pd - a.pd);
};

export default evalTpPairs;