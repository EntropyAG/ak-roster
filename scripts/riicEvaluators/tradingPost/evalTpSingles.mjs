import { getTradingPostStats } from "../evalHelpers.mjs";

import { tpOperators } from "../../../src/data/riic/operators.ts";

/**
 * Returns a list of TP operators with all their productivity
 */
const evalTpSingles = (roster,  base) => {
    let opScores = [];
    for(let opId of [...tpOperators]){
        let operator = roster[opId];
        if(!operator){
            continue;
        }
        let results = getTradingPostStats([operator], base);
        opScores.push({
            "operator": operator.op_id,
            "pd": results.tpProductivity
        });
    }

    return opScores.sort((a, b) => b.pd - a.pd);
};

export default evalTpSingles;