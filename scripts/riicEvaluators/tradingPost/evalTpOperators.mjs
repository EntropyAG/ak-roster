import { getTradingPostStats } from "../evalHelpers.mjs";
import { combinations } from "util/fns/mathUtils.ts";

import { tpOperators } from "../../../src/data/riic/operators.ts";

/**
 * Returns a list of TP operators with all their productivity
 */
const evalTpOperators = (roster, base, flags, squadSize, extraSquads = []) => {
    let opScores = [];
    // Retrieve all the listed operators, remove those who aren't found to save up on calcs
    let operatorsToTest = Object.values(roster).filter(
        e => tpOperators.indexOf(e.op_id) !== -1
    );

    let squads = combinations(operatorsToTest, squadSize);
    for(let extraSquad of extraSquads){
        squads.push(extraSquad);
    }

    for(let squad of squads){
        let results = getTradingPostStats(squad, base, flags, squadSize);
        opScores.push(results);
    }
    return opScores.sort((a, b) => b.totalProductivity - a.totalProductivity);
};

export default evalTpOperators;