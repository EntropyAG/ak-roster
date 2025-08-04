import { composeSquadsOf2, composeSquadsOf3, getPowerPlantStats } from "../evalHelpers.mjs";

import { ppOperators } from "data/riic/operators.ts";

/**
 * Returns a list of TP operators with all their productivity
 */
const evalPPTeams = (roster,  base) => {
    let opScores = [];
    // Retrieve all the listed operators, remove those who aren't found to save up on calcs
    let operatorsToTest = Object.values(roster).filter(
        e => ppOperators.indexOf(e.op_id) !== -1
    );
    // We build squads depends on how many PPs are in base
    let squads;
    if(base.getPowerPlantCount() === 1){
        squads = operatorsToTest;
    }else if(base.getPowerPlantCount() === 2){
        squads = composeSquadsOf2(operatorsToTest);
    }else{
        squads = composeSquadsOf3(operatorsToTest);
    }

    // Finally we actually retrieve the score for all teams
    for(let squad of squads){
        opScores.push(getPowerPlantStats(squad, base));
    }
    return opScores.sort((a, b) => b.droneSpeed - a.droneSpeed);
};

export default evalPPTeams;