import { getControlCenterStats } from "../evalHelpers.mjs";

import { combinations } from "util/fns/mathUtils.ts";

import {
    ccOperatorsFacPd,
    ccOperatorsTpPd,
    ccOperatorsRrSpeed,
    ccOperatorsSmileys,
    ccOperatorsAlterTeam,
    ccOperatorsDormRec,
    ccOperatorsOthers
} from "data/riic/operators.ts";

const CC_SLOT_COUNT = 5;

// Used to give more value to certain buffs compared to others
const CC_BUFFS_WEIGHTS = {
    "facPD": 13,
    "tpPD": 12,
    "clueSpeed": 7,
    "moraleDrainOthers": 3,
    "moraleDrainCC": 2,
    "moraleRecDorm": 1,
    "trainingSpeed": 0,
};

/**
 * Builds a CC team, prioritizing certains buffs over others.
 */
const evalCCTeams = (roster, base) => {
    /**
     * Skills have a different priority with MD buffs at the lowest, since a CC will already provide -0.05 MD
     * to all operators for each occupied slot, even if the operator has no CC-related skills.
     * General priority is as follows:
     *
     * FAC buff = TP buff > RR buffs > MD buffs
     *
     * For the exact buffs that get prioritized, check the CC_BUFFS_WEIGHTS constant.
     */
    let facPdOperators = Object.values(roster).filter(e => ccOperatorsFacPd.indexOf(e.op_id) !== -1);
    let tpPdOperators = Object.values(roster).filter(e => ccOperatorsTpPd.indexOf(e.op_id) !== -1);
    let rrSpeedOperators = Object.values(roster).filter(e => ccOperatorsRrSpeed.indexOf(e.op_id) !== -1);
    let mdOperators = Object.values(roster).filter(e =>
        [...ccOperatorsSmileys, ...ccOperatorsAlterTeam, ...ccOperatorsDormRec, ...ccOperatorsOthers].indexOf(e.op_id) !== -1
    );

    let stack = stackOperators([], facPdOperators);
    stack = stackOperators(stack, tpPdOperators);
    stack = stackOperators(stack, rrSpeedOperators);

    let squads = combinations(mdOperators, CC_SLOT_COUNT - stack[0].length);
    stack = stackOperators(stack, squads);
    // Finally we actually retrieve the score for all teams
    let scores = [];
    for(let squad of stack){
        scores.push(getControlCenterStats(squad, base));
    }
    return scores.sort((a, b) =>
          (b.facPD             - a.facPD             ) * CC_BUFFS_WEIGHTS["facPD"]
        + (b.tpPD              - a.tpPD              ) * CC_BUFFS_WEIGHTS["tpPD"]
        + (b.clueSpeed         - a.clueSpeed         ) * CC_BUFFS_WEIGHTS["clueSpeed"]
        + (b.moraleDrainOthers - a.moraleDrainOthers ) * CC_BUFFS_WEIGHTS["moraleDrainOthers"]
        + (b.moraleDrainCC     - a.moraleDrainCC     ) * CC_BUFFS_WEIGHTS["moraleDrainCC"]
        + (b.moraleRecDorm     - a.moraleRecDorm     ) * CC_BUFFS_WEIGHTS["moraleRecDorm"]
        + (b.trainingSpeed     - a.trainingSpeed     ) * CC_BUFFS_WEIGHTS["trainingSpeed"]
    );
};

const stackOperators = (srcSquads, operators) => {
    // If the target operators are empty, just return the source squads
    if(operators.length === 0){
        return srcSquads;
    }

    let newSquads = [];
    // If the source squad is empty, use the current ops to build squads
    if(srcSquads.length === 0){
        for(let operator of operators){
            newSquads.push([operator]);
        }
        return newSquads;
    }

    // Otherwise, stack them on top of the existing ones
    for(let squad of srcSquads){
        for(let elem of operators){
            if(Array.isArray(elem)){
                newSquads.push([...squad, ...elem]);
            }else{
                newSquads.push([...squad, elem]);
            }
        }
    }
    return newSquads;
};

export default evalCCTeams;