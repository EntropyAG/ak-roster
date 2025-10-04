import { getPowerPlantStats } from "../evalHelpers.mjs";
import { combinations } from "util/fns/mathUtils.ts";
import { ppOperators } from "data/riic/operators.ts";

/**
 * By default, drones are equivalent to 50% PD (without any increase to drone speed recovery).
 * A 20% PP worker is thus equivalent to 10% FAC PD for instance, meaning Justice Knight is equivalent
 * to a 20% PP worker (since it has 10% PP + 5% FAC PD). But the weight is lowered to take into account the fact
 * that it's more restrictive, due to only working with Wildmane while also not scaling with Shamare / Proviso teams,
 * since those increase the value of drones.
 */
const JK_WEIGHT_IF_WILDMANE = 1.99;

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
    return opScores.sort((a, b) => (
        (b.droneSpeed + b.wildmanePd * JK_WEIGHT_IF_WILDMANE)
      - (a.droneSpeed + a.wildmanePd * JK_WEIGHT_IF_WILDMANE)
    ));
};

export default evalPPTeams;