import { getFactoryStats } from "../evalHelpers.mjs";
import { combinations } from "util/fns/mathUtils.ts";

import { facGeneralistOperators, facExpOperators, facGoldOperators } from "data/riic/operators.ts";

/**
 * Returns a list of TP operators with all their productivity
 */
const evalFacPairs = (roster,  base) => {
    let opScores = [];
    // Retrieve all the listed operators, remove those who aren't found to save up on calcs
    let operatorsToTest = Object.values(roster).filter(
        e => [...facGeneralistOperators, ...facGoldOperators, ...facExpOperators].indexOf(e.op_id) !== -1
    );
    // We build squads of 2, since the core operator is always present
    let squads = combinations(operatorsToTest, 2);
    for(let squad of squads){
        let results = getFactoryStats(squad, base);
        opScores.push({
            "operator1": results.operator1,
            "operator2": results.operator2,
            "pdExp": results.totalExpProductivity,
            "pdGold": results.totalGoldProductivity,
            "pdAll": results.totalProductivity,
        });
    }
    return opScores.sort((a, b) => b.pdAll - a.pdAll);
};

export default evalFacPairs;