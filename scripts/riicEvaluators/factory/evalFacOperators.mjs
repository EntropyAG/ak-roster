import { getFactoryStats } from "../evalHelpers.mjs";
import { combinations } from "util/fns/mathUtils.ts";

import { facGeneralistOperators, facExpOperators, facGoldOperators } from "../../../src/data/riic/operators.ts";

/**
 * Returns a list of TP operators with all their productivity
 */
const evalFacOperators = (roster, base, flags, squadSize) => {
    let opScores = [];
    // Retrieve all the listed operators, remove those who aren't found to save up on calcs
    let operatorsToTest = Object.values(roster).filter(
        e => [...facGeneralistOperators, ...facGoldOperators, ...facExpOperators].indexOf(e.op_id) !== -1
    );

    let squads = combinations(operatorsToTest, squadSize);
    for(let squad of squads){
        let results = getFactoryStats(squad, base, flags, squadSize);
        opScores.push(results);
    }
    return opScores.sort((a, b) => b.totalProductivity - a.totalProductivity);
};

export default evalFacOperators;