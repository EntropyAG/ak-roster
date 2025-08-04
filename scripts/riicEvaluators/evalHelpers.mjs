import cnBuildingData from "../ArknightsGameData/zh_CN/gamedata/excel/building_data.json";
import operators from "data/operators.json";

import { roundTo } from "util/fns/mathUtils.ts";
import { riicSkills } from "data/riic/skills.ts";
import { tpOrders, tpDailyLmd } from "data/riic/tpOrders";
import {
    a1Operators,
    bswOperators,
    karlanTradeOperators,
    lateranoOperators,
    samiOperators
} from "data/riic/operators.ts";

const TP_CAPS = {
    1: 6,
    2: 8,
    3: 10
};

const CLUE_SPEED = {
    RARITY: {
        6: 5,
        5: 4,
        4: 2,
        3: 0,
        2: 0,
        1: 0
    },
    ELITE: {
        2: 16,
        1: 8,
        0: 0
    }

};

const MN_PER_DAY = 24 * 60;
const BASELINE_FAC_GOLD_PER_DAY = 20;

/**
 * Returns only RIIC skills that are currently active for a given operator, based
 * on their operator and promotion levels.
 * @param {Operator} operator
 * @returns
 */
const getActiveOperatorRiicSkills = (operator) => {
    let activeSkills = [];
    for(let buff of cnBuildingData.chars[operator.op_id].buffChar){
      /**
       * Operators may have a skill that gets upgraded/replaced with promotion, so we gotta
       * grab the highest one possible for their promotion level.
       * We go in reverse order to grab the best skill first.
       */
      for(let i=buff.buffData.length; i>0; i--){
        if(parseInt(buff.buffData[i-1].cond.phase.split("_")[1]) <= operator.elite){
          activeSkills.push(buff.buffData[i-1]);
          break;
        }
      }
    }
    return activeSkills;
  };

/**
 * Given a list of booleans, returns an integer matching how many are true, used for counting ops
 * @param  {...any} opsUsed: a list of booleans each matching whether an operator is used or not
 * @returns {Integer} count of operators used
 */
export const checkOperatorCount = (...opsUsed) => {
    let count = 0;
    for(let opUsed of opsUsed){
        if(opUsed === true || (opUsed !== undefined && opUsed !== null && opUsed !== false)){
            count++;
        }
    }
    return count;
};

/**
 * Given a list of 3 operators, return the expected stats for a lvl 3 trading post
 * @param  {Array[Operator]} ops: An array containing 2 or 3 operators (functions with less)
 */
export const getTradingPostStats = (
    ops,
    base,
    gnosisBuff = false,
    tpLvl = 3,
    inesInBase = 0,
    wInBase = 0,
    ulpianusInBase = 0
) => {
    // As provided by the various operators, does not include the TP one
    let buffs = {
        "productivity_flat": 0,
        "cap_flat": 0,
        // Swire alter
        "productivity_per_external_cap": 0,
        // Jaye
        "productivity_per_total_cap": 0,
        "productivity_per_diff_max_to_current": 0,
        "cap_per_10_external_productivity": 0,
        // Degenbrecher
        "productivity_per_5_external_cap": 0,
        // Firewhistle
        "productivity_to_others": 0,
        // Lappland & Texas
        "productivity_if_lappland_present": 0,
        "is_texas_present": 0,
        "cap_flat_if_texas_present": 0,
        "is_lappland_present": 0,
        // Vigil / Mitm
        "productivity_per_reception_room_level": 0,
        // Siege alter
        "productivity_if_another_op_present": 0,
        // Lemuen
        "productivity_if_exusiai_present": 0,
        "is_exusiai_present": 0,
        // Exusiai alter
        "laterano_op_count": 0,
        "productivity_per_laterano": 0,
        // Archetto
        "productivity_per_dorm": 0,
        // Quartz
        "productivity_per_recipe": 0,
        // Rose Salt
        "cap_per_trading_post_level": 0,
        // Hoederer
        "productivity_if_ines_working": 0,
        "productivity_if_ines_or_w_working": 0,
        // Underflow
        "productivity_if_ulpianus_in_base": 0,
        // Tailoring (Kafka, Bibeak, Paprika, Diamante, Shamare)
        "tailoring_alpha": 0,
        "tailoring_beta": 0,
        // Tequila
        "max_order_extra_lmd_value": 0,
        // Snowsant
        "copy_productivity_of_other_ops_every_5_up_to": 0
    };
    for(let operator of ops){
        for(let skill of getActiveOperatorRiicSkills(operator)){
            if(!riicSkills[skill.buffId]){
                continue;
            }
            for(let effect of Object.keys(riicSkills[skill.buffId])){
                if(buffs[effect] !== undefined && skill.buffId.indexOf("trade") === 0){
                    buffs[effect] += riicSkills[skill.buffId][effect];
                }
            }
        }
        // Gnosis effect added
        if(gnosisBuff && karlanTradeOperators.includes(operator.op_id)){
            buffs.productivity_flat -= 15;
            buffs.cap_flat += 6;
        }

        // Laterano op check for Exu alter
        if(lateranoOperators.includes(operator.op_id)){
            buffs.laterano_op_count++;
        }
    }

    let tpDefaultCap = TP_CAPS[tpLvl];

    let totalTpProductivity =
        // Standard productivity
        buffs.productivity_flat
        // Degenbrecher (not debuffed by Jaye)
        + Math.max(
            Math.min(buffs.productivity_per_5_external_cap * Math.floor(buffs.cap_flat / 5), 100),
            0
        )
        // Firewhistle
        + buffs.productivity_to_others * (ops.length - 1)
        // Texas / Lappy
        + buffs.is_texas_present * buffs.is_lappland_present * buffs.productivity_if_lappland_present
        // Vigil / Mitm
        + buffs.productivity_per_reception_room_level * base.receptionRoom
        // Siege alter
        + buffs.productivity_if_another_op_present * Math.min(1, ops.length - 1)
        // Lemuen
        + buffs.is_exusiai_present * buffs.productivity_if_exusiai_present
        // Exusiai alter
        + buffs.productivity_per_laterano * buffs.laterano_op_count
        // Archetto
        + buffs.productivity_per_dorm * base.getSumOfDormLevels()
        // Quartz
        + buffs.productivity_per_recipe * base.getDifferentRecipesCount()
        // Hoederer
        + buffs.productivity_if_ines_working * inesInBase
        + buffs.productivity_if_ines_or_w_working * Math.max(inesInBase, wInBase)
        // Underflow
        + buffs.productivity_if_ulpianus_in_base * ulpianusInBase
    ;

    // Snowsant
    totalTpProductivity +=
        Math.floor(
            Math.min(buffs.copy_productivity_of_other_ops_every_5_up_to / 5, totalTpProductivity / 5) * 5
        )
    ;

    let bonusCap =
        buffs.cap_flat
        // Jaye exclusive, cap reduction based on other ops productivity
        + buffs.cap_per_10_external_productivity * Math.floor(totalTpProductivity / tpDefaultCap)
        // Texas / Lappland
        + buffs.is_texas_present * buffs.is_lappland_present * buffs.cap_flat_if_texas_present
        // Rose Salt
        + buffs.cap_per_trading_post_level * tpLvl
    ;

    totalTpProductivity +=
    // Jaye exclusive
    (
        + buffs.productivity_per_total_cap * (bonusCap + tpDefaultCap)
        + buffs.productivity_per_diff_max_to_current * (bonusCap + tpDefaultCap)
    ) / 2
    // Swire alter exclusive
    + buffs.productivity_per_external_cap * bonusCap;

    // Tailoring buffs + Tequila
    let eqFacProductivity = 0;
    let weightIdx = 0;
    if(buffs.tailoring_beta >= 1){
        weightIdx = 3;
    }else if(buffs.tailoring_alpha >= 2){
        weightIdx = 2;
    }else if(buffs.tailoring_alpha === 1){
        weightIdx = 1;
    }
    let weights = tpOrders.weights[weightIdx];

    let weightedLMDValue =
        weights[0] * (tpOrders.goldValues[0] * 2)
      + weights[1] * (tpOrders.goldValues[0] * 3)
      + weights[2] * (tpOrders.goldValues[0] * 4 +  buffs.max_order_extra_lmd_value);

    let weightedTime =
        weights[0] * tpOrders.time[2]
      + weights[1] * tpOrders.time[3]
      + weights[2] * tpOrders.time[4];

    // Divide both for estimated PD (TP3 as a baseline)
    let lmdPerDay = weightedLMDValue * MN_PER_DAY / weightedTime;
    let pdGainOverBaseline = lmdPerDay / tpDailyLmd[tpLvl - 1];
    totalTpProductivity += roundTo(pdGainOverBaseline - 1, 2);

    // Gold contrib (how much gold FAC PD we get from Tequila)
    if(buffs.max_order_extra_lmd_value > 0){
        let weightedExtraBarsPerOrder = weights[2]
          * (buffs.max_order_extra_lmd_value === 500 ? 1 : 0.5);
        let weightedGoldBonus = weightedExtraBarsPerOrder * MN_PER_DAY / weightedTime / BASELINE_FAC_GOLD_PER_DAY;
        let goldContribution = weightedGoldBonus * (100 + totalTpProductivity) / 100;
        eqFacProductivity = roundTo(goldContribution * 100, 2);
    }

    return {
        "operator1": ops[0],
        "operator2": ops[1],
        "operator3": ops[2],
        "bonusCap": bonusCap,
        "totalCap": bonusCap + tpDefaultCap,
        "totalProductivity": totalTpProductivity + eqFacProductivity,
        "tpProductivity": totalTpProductivity,
        "facProductivity": eqFacProductivity
    };
};


/**
 * Given a list of 3 operators, return the expected stats for a factory
 * @param  {Array[Operator]} ops: An array containing 2 or 3 operators (functions with less)
 * @param  {Array[Object]} base: An array listing details about the base (number of dorms,
 * FAC & TP distribution...)
 */
export const getFactoryStats = (
    ops,
    base,
    hasVivianaBuff = 0,
    hasFlametailBuff = 0,
    hasJKinPP = 0,
    bswOpInBase = 0,
    robotsInPPCount = 0,
    isGummyInTP = 0,
    monsterMealCount = 0
) => {
    // As provided by the various operators
    let buffs = {
        // ======= General =======
        "productivity_flat": 0,
        "productivity_exp_flat": 0,
        "productivity_gold_flat": 0,
        "productivity_per_hour_5_stacks": 0,
        "productivity_per_hour_10_stacks": 0,
        "cap_exp_flat": 0,
        "cap_all_flat": 0,
        // ======= Specific combos =======
        // Tragodia / Ms Christine duo
        "tragodia_present": 0,
        "christine_feasting": 0,
        // Standardization (Mizuki/Highmore)
        "productivity_per_standard_skill": 0,
        "standardization_skill_count": 0,
        "convert_RT_PS_to_standard": 0,
        // Pinus Sylvestris (Viviana/Flametail)
        "pinus_sylvestris_skill_count": 0,
        "has_wild_mane": 0,
        // Rhine Tech (Dorothy)
        "productivity_per_rhine_tech_skill": 0,
        "rhine_tech_skill_count": 0,
        // Metalwork (Bryophyta core)
        "productivity_per_metalwork": 0,
        "metalwork_skill_count": 0,
        // Vermeil
        "productivity_per_total_cap_vermeil": 0,
        "is_bubble_absent": 1,
        // Bubble
        "productivity_per_individual_cap_above_16": 0,
        "productivity_per_total_cap_bubble": 0,
        "sum_of_cap_above_16": 0,
        // Narantuya
        "productivity_gold_per_dorm_sum": 0,
        // Thorns alter, Purestream
        "productivity_gold_per_trading_post": 0,
        // Fang alter
        "productivity_per_A1_operator": 0,
        "A1_operator_count": 0,
        // Almond
        "productivity_gold_per_BSW_operator": 0,
        // Alanna
        "productivity_gold_per_robot_in_pp": 0,
        "alanna_give_me_a_hand": 0,
        // Warmy
        "is_warmy_present": 0,
        // Leto
        "leto_through_thick_and_thin": 0,
        // Waai Fu
        "waai_fu_copy_productivity": 0,
        // Minimalist
        "engineering_robot_per_facility_level_max_64": 0,
        "productivity_per_16_engineering_robot": 0,
        "productivity_per_8_engineering_robot": 0,
        // Marcille
        "productivity_per_monster_meal": 0,
        // Totter
        "productivity_flat_if_morale_diff_gt_12": 0,
        "cap_flat_if_morale_diff_gt_12": 0,
        "productivity_per_4_morale_difference": 0
    };
    // We keep adding all the operator skills to the list of buffs...
    for(let operator of ops){
        for(let skill of getActiveOperatorRiicSkills(operator)){
            // ...but only if they have some kind of effect, go to next skill
            if(!riicSkills[skill.buffId]){
                continue;
            }
            for(let effect of Object.keys(riicSkills[skill.buffId])){
                if(buffs[effect] !== undefined && skill.buffId.indexOf("manu") === 0){
                    buffs[effect] += riicSkills[skill.buffId][effect];
                }
            }
        }
        // ===== Complementary checks =====
        // sum_of_cap_above_16 (Bubble)
        if(operator.op_id === "char_369_bena"){
            buffs.sum_of_cap_above_16 += 17;
        }
        if(operator.op_id === "char_163_hpsts" && operator.elite === 2){
            buffs.sum_of_cap_above_16 += 19;
        }
        // Bubble's skill takes precedence over Vermeil's skill
        if(operator.op_id === "char_381_bubble"){
            buffs.is_bubble_absent = 0;
        }
        // has_wild_mane (Wild Mane) - check necessary since WM shares the same skill with other PS
        if(operator.op_id === "char_496_wildmn"){
            buffs.has_wild_mane = 1;
        }
        // A1 operator count (Fang alter)
        if(a1Operators.includes(operator.op_id)){
            buffs.A1_operator_count += 1;
        }
        // Blacksteel Worldwide count (Almond)
        if(bswOperators.includes(operator.op_id)){
            bswOpInBase += 1;
        }
        // Warmy present for Alanna buff
        if(operator.op_id === "char_4081_warmy"){
           buffs.is_warmy_present = 1;
        }
    }
    // Generalistic
    let allPD = 0
        + buffs.productivity_flat
        + buffs.productivity_per_hour_5_stacks  * (5/2 + 7) / 12 // 12h weighted average
        + buffs.productivity_per_hour_10_stacks * (10/2 + 2) / 12 // 12h weighted average
        // Vermeil
        + buffs.cap_all_flat * buffs.productivity_per_total_cap_vermeil * buffs.is_bubble_absent
        // Bubble
        + buffs.productivity_per_individual_cap_above_16 * buffs.sum_of_cap_above_16
        + (buffs.cap_all_flat - buffs.sum_of_cap_above_16) * buffs.productivity_per_total_cap_bubble
        // Tragodia and Ms Christine in same FAC
        + buffs.tragodia_present * buffs.christine_feasting * 30
        + buffs.productivity_per_standard_skill * (
            buffs.standardization_skill_count
            + buffs.convert_RT_PS_to_standard * (
                buffs.rhine_tech_skill_count + buffs.pinus_sylvestris_skill_count
            )
        )
        + buffs.pinus_sylvestris_skill_count * hasVivianaBuff * 7
        + buffs.has_wild_mane * hasJKinPP * 5 // Justice Knight in PP and Wild Mane present
        + buffs.rhine_tech_skill_count * buffs.productivity_per_rhine_tech_skill
        + buffs.metalwork_skill_count * buffs.productivity_per_metalwork
        + buffs.A1_operator_count * buffs.productivity_per_A1_operator
        + (
              Math.floor(buffs.engineering_robot_per_facility_level_max_64 * Math.min(64, base.getSumOfFacilityLevels()) / 16)
            * buffs.productivity_per_16_engineering_robot
            + Math.floor(buffs.engineering_robot_per_facility_level_max_64 * Math.min(64, base.getSumOfFacilityLevels()) / 8)
            * buffs.productivity_per_8_engineering_robot
        )
        + buffs.productivity_per_monster_meal * monsterMealCount // Marcille with external Senshi buff
        /**
         * Totter - very messy due to vastly different PD, would require taking into account 12h+ rotations
         * for accurate results, so here's a somewhat weighted PD modifier.
         * Numbers match the number of stacks per every 4h >=12 morale (so 24, 20, 16 and 12), divided
         * by the number of weights. Basically, it's the same as multiplying by 0.75, but the point is to make
         * it clear that the skill is more complex than that
         */
        + buffs.productivity_per_4_morale_difference * (0 + 1 + 2 + 3) / 4
    ;

    // Gold only
    let goldPD = 0
        + buffs.productivity_gold_flat
        // Narantuya
        + buffs.productivity_gold_per_dorm_sum * base.getSumOfDormLevels()
        // Jessicat alter buff (CC)
        + buffs.productivity_gold_per_BSW_operator * bswOpInBase
        // Alanna
        + buffs.productivity_gold_per_robot_in_pp * robotsInPPCount
        + buffs.alanna_give_me_a_hand * buffs.is_warmy_present * 15
        // Flametail (CC)
        + buffs.pinus_sylvestris_skill_count * hasFlametailBuff * -10
    ;

    // EXP only
    let expPD = 0
        + buffs.productivity_exp_flat
        // Leto
        + buffs.leto_through_thick_and_thin * isGummyInTP * 35
        // Flametail (CC)
        + buffs.pinus_sylvestris_skill_count * hasFlametailBuff * 10
        // Vermeil
        + buffs.cap_exp_flat * buffs.productivity_per_total_cap_vermeil * buffs.is_bubble_absent
        // Bubble
        + buffs.cap_exp_flat * buffs.productivity_per_total_cap_bubble
    ;

    /**
     * Waai Fu
     * -
     * Special conditions, because she doesn't work with Automation / Abyssal hunters (handled elsewhere)
     * and most importantly Purestream, hence why it's added separately
     */
    allPD +=
        Math.floor(
            Math.min(
                buffs.waai_fu_copy_productivity / 5,
                (allPD + goldPD) / 5,
                (allPD + expPD) / 5
            ) * 5
        )
    ;

    // Purestream
    goldPD += buffs.productivity_gold_per_trading_post * base.getTradingPostCount();

    return {
        "operator1": ops[0],
        "operator2": ops[1],
        "operator3": ops[2],
        "expCap": buffs.cap_exp_flat,
        "totalCap": buffs.cap_all_flat + buffs.cap_exp_flat,
        "totalProductivity": roundTo(allPD, 2),
        "totalExpProductivity": roundTo(allPD + expPD, 2),
        "totalGoldProductivity": roundTo(allPD + goldPD, 2)
    };
};

/**
 * Given a list of up to 2 operators, return the expected stats for the reception room
 * @param  {Array[Operator]} ops: An array containing 1 or 2 operators
 */
export const getReceptionRoomStats = (
    ops,
    base,
    isFiamInDorm = 0,
    isClueExchangeOngoing = 1
) => {
    // As provided by the various operators
    let buffs = {
        "clue_speed": 0,
        // Valarqvin
        "clue_speed_if_typhoon_present": 0,
        "is_typhoon_present": 0,
        // Vulpisfoglia
        "clue_speed_if_suzuran_present": 0,
        "is_suzuran_present": 0,
        // Sankta Miksaparato
        "clue_speed_if_fiammetta_in_dorm": 0,
        // Typhoon
        "clue_speed_if_sami_present": 0,
        "is_sami_present": 0,
        // Surfer
        "clue_speed_if_bsw_present": 0,
        "is_bsw_present": 0,
        // Caper
        "clue_speed_if_exchange_ongoing": 0,
        // Solo-ers
        "clue_speed_solo": 0,
        // Windscoot
        "clue_speed_per_recruitment_slot": 0,
        // Ines
        "clue_speed_per_hour_5_stacks": 0
    };

    for(let operator of ops){
        for(let skill of getActiveOperatorRiicSkills(operator)){
            if(!riicSkills[skill.buffId]){
                continue;
            }
            for(let effect of Object.keys(riicSkills[skill.buffId])){
                if(buffs[effect] !== undefined && skill.buffId.indexOf("meet") === 0){
                    buffs[effect] += riicSkills[skill.buffId][effect];
                }
            }
        }
        /**
         * Innate bonuses
         * All operators provide a buff to clue speed based on their rarity and promotion level,
         * on top of a 5% innate bonus no matter who the op is
         */
        let rarity = operators[operator.op_id].rarity;
        buffs.clue_speed += CLUE_SPEED.RARITY[rarity];
        buffs.clue_speed += CLUE_SPEED.ELITE[operator.elite];
        buffs.clue_speed += 5;

        // We exclude Typhoon, since she doesn't count herself for her skill
        if(samiOperators.includes(operator.op_id) && operator.op_id !== "char_2012_typhon"){
            buffs.is_sami_present = 1;
        }

        // We exclude Surfer, since she doesn't count herself for her skill
        if(bswOperators.includes(operator.op_id) && operator.op_id !== "char_4052_surfer"){
            buffs.is_sami_present = 1;
        }

        if(operator.op_id === "char_358_lisa"){
            buffs.is_suzuran_present = 1;
        }
    }

    let clueSpeed = buffs.clue_speed
        // Valarqvin
        + buffs.clue_speed_if_typhoon_present * buffs.is_typhoon_present
        // Vulpisfoglia
        + buffs.clue_speed_if_suzuran_present * buffs.is_suzuran_present
        // Typhoon
        + buffs.clue_speed_if_sami_present * buffs.is_sami_present
        // Surfer
        + buffs.clue_speed_if_bsw_present * buffs.is_bsw_present
        // Caper
        + buffs.clue_speed_if_exchange_ongoing * isClueExchangeOngoing
        // Sankta Miksaparato
        + buffs.clue_speed_if_fiammetta_in_dorm * isFiamInDorm
        // Windscoot
        + buffs.clue_speed_per_recruitment_slot * base.getRecruitmentSlotsCount()
        // Solo-ers
        + buffs.clue_speed_solo * (ops.length === 1 ? 1 : 0)
        // Ines
        + buffs.clue_speed_per_hour_5_stacks * (5/2 + 7) / 12 // 12h weighted average
    ;

    return {
        "operator1": ops[0],
        "operator2": ops[1],
        "clueSpeed": clueSpeed
    };
};

/**
 * For a list of operators given as input, returns an array containing all combos of 3 operators possible
 * @param {Array[Operator]} operators: A list of at least 3 operators
 */
export const composeSquadsOf3 = (operators) => {
    if(!operators || operators.length < 3){
        throw new Error("Squad composition requires at least 3 operators to function");
    }
    let compositions = [];
    let op1 = 0;
    let op2 = 1;
    let op3 = 2;
    while(true){
        compositions.push([operators[op1], operators[op2], operators[op3]]);
        if(op1 === operators.length - 3){
            return compositions;
        }
        op3++;
        if(op3 === operators.length){
            op2++;
            op3 = op2 + 1;
            if(op2 === operators.length - 1){
                op1++;
                op2 = op1 + 1;
                op3 = op2 + 1;
            }
        }
    }
};

/**
 * For a list of operators given as input, returns an array containing all pairs of operators possible
 * @param {Array[Operator]} operators: A list of at least 2 operators
 */
export const composeSquadsOf2 = (operators) => {
    if(!operators || operators.length < 2){
        throw new Error("Squad composition requires at least 2 operators to function");
    }
    let compositions = [];
    let op1 = 0;
    let op2 = 1;
    while(true){
        compositions.push([operators[op1], operators[op2]]);
        if(op1 === operators.length - 2){
            return compositions;
        }
        op2++;
        if(op2 === operators.length){
            op1++;
            op2 = op1 + 1;
        }
    }
};