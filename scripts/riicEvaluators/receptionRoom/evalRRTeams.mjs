import { composeSquadsOf2, getReceptionRoomStats } from "../evalHelpers.mjs";

import { rrOperators, rrOperatorsSolo } from "../../../src/data/riic/operators.ts";

/**
 * Returns a list of TP operators with all their productivity
 */
const evalRRTeams = (roster,  base) => {
    let opScores = [];
    // Retrieve all the listed operators, remove those who aren't found to save up on calcs
    let operatorsToTest = Object.values(roster).filter(
        e => rrOperators.indexOf(e.op_id) !== -1
    );
    // We build squads of 2, since the core operator is always present
    let squads = composeSquadsOf2(operatorsToTest);
    // Then we add the few ops that have bonuses while alone
    for(let soloer of rrOperatorsSolo){
        squads.push([soloer]);
    }
    // Finally we actually retrieve the score for all teams
    for(let squad of squads){
        opScores.push(getReceptionRoomStats(squad, base));
    }
    return opScores.sort((a, b) => b.clueSpeed - a.clueSpeed);
};

export default evalRRTeams;