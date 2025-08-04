import { getOfficeStats } from "../evalHelpers.mjs";

import { hrOperators } from "data/riic/operators.ts";

/**
 * Returns a list of TP operators with all their productivity
 */
const evalOfficeOps = (roster,  base) => {
    let opScores = [];
    // Retrieve all the listed operators, remove those who aren't found to save up on calcs
    let operatorsToTest = Object.values(roster).filter(
        e => hrOperators.indexOf(e.op_id) !== -1
    );
    // Finally we actually retrieve the score for all teams
    for(let operator of operatorsToTest){
        opScores.push(getOfficeStats(operator, base));
    }
    return opScores.sort((a, b) => (b.hireSpeed + b.clueSpeed) - (a.hireSpeed + a.clueSpeed));
};

export default evalOfficeOps;