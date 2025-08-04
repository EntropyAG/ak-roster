import { getFactoryStats } from "../evalHelpers.mjs";

import { facGeneralistOperators, facExpOperators, facGoldOperators } from "data/riic/operators.ts";

/**
 * Returns a list of FAC operators with all their productivity (general, EXP and gold)
 */
const evalFacSingles = (roster,  base) => {
    let opScores = [];
    for(let opId of [...facGeneralistOperators, ...facGoldOperators, ...facExpOperators]){
        let operator = roster[opId];
        if(!operator){
            continue;
        }
        let results = getFactoryStats([operator], base);
        opScores.push({
            "operator": operator.op_id,
            "pdExp": results.totalExpProductivity,
            "pdGold": results.totalGoldProductivity,
            "pdAll": results.totalProductivity,
        });
    }

    return opScores;
};

export default evalFacSingles;