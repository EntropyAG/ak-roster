import { getPowerPlantStats } from "../evalHelpers.mjs";
import { combinations } from "util/fns/mathUtils.ts";
import { ppOperators } from "data/riic/operators.ts";

/**
 * Returns a list of TP operators with all their productivity
 */
const evalPPTeams = (roster,  base, flags) => {
    let opScores = [];
    // Retrieve all the listed operators, remove those who aren't found to save up on calcs
    let operatorsToTest = Object.values(roster).filter(
        e => ppOperators.indexOf(e.op_id) !== -1
    );
    // We build squads depends on how many PPs are in base
    let squads = combinations(operatorsToTest, base.getPowerPlantCount());

    // Finally we actually retrieve the score for all teams
    for(let squad of squads){
        opScores.push(getPowerPlantStats(squad, base, flags));
    }
    return opScores.sort((a, b) => b.droneSpeed - a.droneSpeed);
};

export default evalPPTeams;