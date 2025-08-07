import cnBuildingData from "../ArknightsGameData/zh_CN/gamedata/excel/building_data.json";
import operators from "data/operators.json";

import { roundTo, weightedTimeAverage } from "util/fns/mathUtils.ts";
import { riicSkills } from "data/riic/skills.ts";
import { tpOrders, tpDailyLmd } from "data/riic/tpOrders";
import {
    a1Operators,
    bswOperators,
    karlanTradeOperators,
    lateranoOperators,
    samiOperators,
    lungmenGuardOperators,
    alterOperators,
    ursusStudentOperators
} from "data/riic/operators.ts";

import { DEFAULT_FLAGS } from "../basemaker.mjs";

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
 * Given a list of 3 operators, return the expected stats for a trading post
 * @param  {Array[Operator]} ops: An array containing 1 to 3 operators
 */
export const getTradingPostStats = (ops, base, flags = DEFAULT_FLAGS, tpLvl = 3) => {
    // As provided by the various operators, does not include the TP one
    let buffs = {
        "productivity_flat": 0,
        "cap_flat": 0,
        // Proviso
        "defaulted_order_extra_bar": 0,
        // Gnosis + Karlan Trade
        "karlan_trade_operator_count": 0,
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
        if(flags.gnosisBuff === 1 && karlanTradeOperators.includes(operator.op_id)){
            buffs.karlan_trade_operator_count++;
        }

        // Laterano op check for Exu alter
        if(lateranoOperators.includes(operator.op_id)){
            buffs.laterano_op_count++;
        }
    }

    let tpDefaultCap = TP_CAPS[tpLvl];

    /**
     * If we have a Gnosis (de)buff and at least one KT operator, then we also do the calcs without it. We'll
     * return the best result of the two.
     */ 
    let resultsWithoutGnosis;
    if(flags.gnosisBuff === 1 && buffs.karlan_trade_operator_count > 0){
        let tmpFlags = structuredClone(flags);
        tmpFlags.gnosisBuff = 0;
        resultsWithoutGnosis = getTradingPostStats(ops, base, tmpFlags, tpLvl);
    }

    let totalTpProductivity =
        // Standard productivity
        buffs.productivity_flat
        // Gnosis buff (only active if Jaye or Swire alter part of team)
        + flags.gnosisBuff * buffs.karlan_trade_operator_count * -15
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
        + buffs.productivity_if_ines_working * flags.inesInBase
        + buffs.productivity_if_ines_or_w_working * Math.max(flags.inesInBase, flags.wInBase)
        // Underflow
        + buffs.productivity_if_ulpianus_in_base * flags.ulpianusInBase
    ;

    // Snowsant - added later since she copies the previous productivity up to a cap
    totalTpProductivity +=
        Math.floor(
            Math.min(buffs.copy_productivity_of_other_ops_every_5_up_to / 5, totalTpProductivity / 5) * 5
        )
    ;

    let bonusCap =
        buffs.cap_flat
        // Gnosis buff (only active if Jaye or Swire alter part of team)
        + flags.gnosisBuff * buffs.karlan_trade_operator_count * 6
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

    // Tailoring buffs + Tequila + Proviso
    let eqFacProductivity = 0;
    let weightIdx = 0;
    if(buffs.tailoring_beta >= 1){
        weightIdx = 3;
    }else if(buffs.tailoring_alpha >= 2){
        weightIdx = 2;
    }else if(buffs.tailoring_alpha === 1){
        weightIdx = 1;
    }
    let weights = tpOrders.tp3weights[weightIdx];
    if(tpLvl === 2){
        weights = tpOrders.tp2weights[weightIdx];
    }

    let weightedLMDValue =
        weights[0] * tpOrders.goldValues[0] * (2 + buffs.defaulted_order_extra_bar)
      + weights[1] * tpOrders.goldValues[0] * (3 + buffs.defaulted_order_extra_bar)
      + weights[2] * tpOrders.goldValues[0] * 4 +  buffs.max_order_extra_lmd_value;

    let weightedTime =
        weights[0] * tpOrders.time[2]
      + weights[1] * tpOrders.time[3]
      + weights[2] * tpOrders.time[4];

    /**
     * Divide both for estimated PD (TP3 as a baseline)
     * Will result in an apparent downgrade of productivity for most operators if the TP being filled is lvl 2.
     * This is because the baseline remains a lvl 3 TP, which produces very slightly more LMD per day compared
     * to a lvl 2, which means it's also better to put your best PD ops in the highest level TP if possible,
     * with the only exception being for Proviso due to how her base skill functions.
     */
    let lmdPerDay = weightedLMDValue * MN_PER_DAY / weightedTime;
    // We use a lvl 3 TP as a baseline, even if the current TP level is 2.
    // This is to better to compare LMD production for with Proviso / Tailoring / Tequila.
    let pdGainOverBaseline = lmdPerDay / tpDailyLmd[2];
    /**
     * This calculation allows tailoring, Tequila and Proviso to be closer to their actual productivity
     * since they act as multipliers to the final productivity, which includes both innate TP bonuses
     * like the 1% PD per slot, as well as external buffs like the 7% PD from CC skills like Amiya's or
     * Swire's.
     * This will result in a lower performance for everyone else, but the actual order of the best operators
     * is maintained, which is the entire point of finding out the best ops.
     */
    let tpContrib =
        pdGainOverBaseline * (
              totalTpProductivity / 100 // Convert to %
            + 1.07 // 100% from Base TP production + 7% from CC
            + tpLvl / 100 // 1% PD per slot, so a lvl 3 TP = 3% PD for having ops slotted
        )
        /* After taking into account the final productivity, we remove the basic TP production (100%)
         * as well as the CC buff (7%) and innate bonuses (3%) from a baseline comparison, which is a
         * lvl 3 TP, hence why the value is always 1.1 (or 110%).
         */
        - 1.1
    ;
    totalTpProductivity = roundTo(tpContrib * 100, 2);

    // Gold contrib (how much gold FAC PD we get from Tequila)
    if(buffs.max_order_extra_lmd_value > 0){
        let weightedExtraBarsPerOrder = weights[2]
          * (buffs.max_order_extra_lmd_value === 500 ? 1 : 0.5);
        let weightedGoldBonus = weightedExtraBarsPerOrder * MN_PER_DAY / weightedTime / BASELINE_FAC_GOLD_PER_DAY;
        let goldContribution = weightedGoldBonus * (100 + totalTpProductivity) / 100;
        eqFacProductivity = roundTo(goldContribution * 100, 2);
    }

    // Now we replace the evaluation by the non-Gnosis one if we have a possible replacement AND if it's better.
    if(resultsWithoutGnosis?.totalProductivity >= (totalTpProductivity + eqFacProductivity)){
        return resultsWithoutGnosis;
    }

    return {
        "operator1": ops[0],
        "operator2": ops[1],
        "operator3": ops[2],
        "bonusCap": bonusCap,
        "totalCap": bonusCap + tpDefaultCap,
        "totalProductivity": totalTpProductivity + eqFacProductivity,
        "tpProductivity": totalTpProductivity,
        "facProductivity": eqFacProductivity,
        "usesGnosis": buffs.karlan_trade_operator_count > 0 ? flags.gnosisBuff : false
    };
};


/**
 * Given a list of 3 operators, return the expected stats for a factory
 * @param  {Array[Operator]} ops: An array containing 2 or 3 operators (functions with less)
 * @param  {Array[Object]} base: An array listing details about the base (number of dorms,
 * FAC & TP distribution...)
 */
export const getFactoryStats = (ops, base, flags = DEFAULT_FLAGS) => {
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
        "bsw_operator_count": 0,
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
        // Jessica alter in CC + BlackSteel Worldwide
        if(bswOperators.includes(operator.op_id)){
            buffs.bsw_operator_count++;
        }
        // Warmy present for Alanna buff
        if(operator.op_id === "char_4081_warmy"){
           buffs.is_warmy_present = 1;
        }
    }
    // Generalistic
    let allPD = 0
        + buffs.productivity_flat
        + weightedTimeAverage(buffs.productivity_per_hour_5_stacks, 5, 12)
        + weightedTimeAverage(buffs.productivity_per_hour_10_stacks, 10, 12)
        // Vermeil
        + buffs.cap_all_flat * buffs.productivity_per_total_cap_vermeil * buffs.is_bubble_absent
        // Bubble
        + buffs.productivity_per_individual_cap_above_16 * buffs.sum_of_cap_above_16
        + (buffs.cap_all_flat - buffs.sum_of_cap_above_16) * buffs.productivity_per_total_cap_bubble
        // Tragodia and Ms Christine in same FAC
        + buffs.tragodia_present * buffs.christine_feasting * 30
        // Mizuki / Highmore Standardization
        + buffs.productivity_per_standard_skill * (
            buffs.standardization_skill_count
            + buffs.convert_RT_PS_to_standard * (
                buffs.rhine_tech_skill_count + buffs.pinus_sylvestris_skill_count
            )
        )
        // Pinus Sylvestris
        + buffs.pinus_sylvestris_skill_count * flags.hasVivianaBuff * 7
        // Wild Mane
        + buffs.has_wild_mane * flags.hasJKinPP * 5
        // Dorothy
        + buffs.rhine_tech_skill_count * buffs.productivity_per_rhine_tech_skill
        // Bryophyta
        + buffs.metalwork_skill_count * buffs.productivity_per_metalwork
        // Fang alter
        + buffs.A1_operator_count * buffs.productivity_per_A1_operator
        + (
              Math.floor(buffs.engineering_robot_per_facility_level_max_64 * Math.min(64, base.getSumOfFacilityLevels()) / 16)
            * buffs.productivity_per_16_engineering_robot
            + Math.floor(buffs.engineering_robot_per_facility_level_max_64 * Math.min(64, base.getSumOfFacilityLevels()) / 8)
            * buffs.productivity_per_8_engineering_robot
        )
        // Senshi (meal) + Marcille (productivity)
        + buffs.productivity_per_monster_meal * flags.monsterMealCount
        // Jessica alter + BSW
        + buffs.bsw_operator_count * flags.hasJessicaAlterBuff * 5
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
        // Almond
        + buffs.productivity_gold_per_BSW_operator * Math.min(flags.bswOpInBase, 3)
        // Alanna
        + buffs.productivity_gold_per_robot_in_pp * flags.robotsInPPCount
        + buffs.alanna_give_me_a_hand * buffs.is_warmy_present * 15
        // Flametail (CC)
        + buffs.pinus_sylvestris_skill_count * flags.hasFlametailBuff * -10
    ;

    // EXP only
    let expPD = 0
        + buffs.productivity_exp_flat
        // Leto
        + buffs.leto_through_thick_and_thin * flags.isGummyInTP * 35
        // Flametail (CC)
        + buffs.pinus_sylvestris_skill_count * flags.hasFlametailBuff * 10
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
    allPD += buffs.waai_fu_copy_productivity * Math.min(
        Math.floor(
            Math.max(
                (allPD + goldPD) / 5,
                (allPD + expPD) / 5
            ) * 5
        ),
        40 // Cap to copied PD
    );

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
export const getReceptionRoomStats = (ops, base, flags = DEFAULT_FLAGS) => {
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
        + buffs.clue_speed_if_exchange_ongoing * flags.isClueExchangeOngoing
        // Sankta Miksaparato
        + buffs.clue_speed_if_fiammetta_in_dorm * flags.isFiamInDorm
        // Windscoot
        + buffs.clue_speed_per_recruitment_slot * base.getRecruitmentSlotsCount()
        // Solo-ers
        + buffs.clue_speed_solo * (ops.length === 1 ? 1 : 0)
        // Ines
        + weightedTimeAverage(buffs.clue_speed_per_hour_5_stacks, 5, 12)
    ;

    return {
        "operator1": ops[0],
        "operator2": ops[1],
        "clueSpeed": clueSpeed
    };
};

/**
 * Given an array of 1 to 3 operators, return the expected stats with all the power plants filled
 * @param  {Array[Operator]} ops: An array containing 1 to 3 operators
 */
export const getPowerPlantStats = (ops, base, flags = DEFAULT_FLAGS) => {
    // As provided by the various operators
    let buffs = {
        "drone_speed": 0,
        // Spuria
        "drone_speed_per_hour_5_stacks": 0,
        // Justice Knight
        "productivity_to_wild_mane": 0,
        // Friston-3
        "drone_speed_if_kaltsit_in_cc": 0,
        // Phonor
        "drone_speed_if_logos_in_tr": 0,
        // Confess-47
        "drone_speed_if_laterano_in_other_pp": 0,
        "has_laterano_in_pp": 0,
        // Philae
        "drone_speed_per_total_dorm_level": 0,
        // Muelsyse
        "drone_speed_per_rhine_5_stacks": 0,
        // Greyy alter
        "drone_speed_per_10_drone_cap": 0
    };

    for(let operator of ops){
        for(let skill of getActiveOperatorRiicSkills(operator)){
            if(!riicSkills[skill.buffId]){
                continue;
            }
            for(let effect of Object.keys(riicSkills[skill.buffId])){
                if(buffs[effect] !== undefined && skill.buffId.indexOf("power") === 0){
                    buffs[effect] += riicSkills[skill.buffId][effect];
                }
            }
        }

        // We exclude Confess, since they don't count for their own skill
        if(lateranoOperators.includes(operator.op_id) && operator.op_id !== "char_4188_confes"){
            buffs.has_laterano_in_pp = 1;
        }

    }

    let droneSpeed = buffs.drone_speed
        // Spuria
        + weightedTimeAverage(buffs.drone_speed_per_hour_5_stacks, 5, 12)
        // Friston
        + buffs.drone_speed_if_kaltsit_in_cc * flags.isKaltsitInCC
        // Phonor
        + buffs.drone_speed_if_logos_in_tr * flags.isLogosInTR
        // Confess-47
        + buffs.drone_speed_if_laterano_in_other_pp * buffs.has_laterano_in_pp
        // Philae
        + buffs.drone_speed_per_total_dorm_level * base.getSumOfDormLevels()
        // Muelsyse
        + buffs.drone_speed_per_rhine_5_stacks * Math.min(flags.rhineOpsInBase, 5)
        // Greyy alter
        + buffs.drone_speed_per_10_drone_cap * base.getDroneCap() / 10
    ;

    return {
        "operator1": ops[0],
        "operator2": ops[1],
        "operator3": ops[2],
        "droneSpeed": droneSpeed,
        "wildmanePd": buffs.productivity_to_wild_mane
    };
};


/**
 * Given an operator, return the expected hiring speed for the Human Resources/Office
 * @param  {Operator} operator:
 */
export const getOfficeStats = (operator, base) => {
    // As provided by the various operators
    let buffs = {
        "hire_speed": 0,
        // Tin Man
        "hire_speed_per_dorm_level": 0,
        // Lin
        "hire_speed_per_extra_recruitment_slot": 0,
        // Tsukinogi, Insider, Mr Nothing
        "clue_speed_per_extra_recruitment_slot": 0
    };

    for(let skill of getActiveOperatorRiicSkills(operator)){
        if(!riicSkills[skill.buffId]){
            continue;
        }
        for(let effect of Object.keys(riicSkills[skill.buffId])){
            if(buffs[effect] !== undefined && skill.buffId.indexOf("hire") === 0){
                buffs[effect] += riicSkills[skill.buffId][effect];
            }
        }
    }

    let hireSpeed = buffs.hire_speed
        // Tin Man
        + buffs.hire_speed_per_dorm_level * base.getSumOfDormLevels()
        // Lin
        + buffs.hire_speed_per_extra_recruitment_slot * base.getExtraRecruitSlotsCount()
    ;

    // Tsukinogi, Insider, Mr Nothing
    let clueSpeed = buffs.clue_speed_per_extra_recruitment_slot * base.getExtraRecruitSlotsCount();

    return {
        "operator": operator,
        "hireSpeed": hireSpeed,
        "clueSpeed": clueSpeed
    };
};

/**
 * Given input operators, return the expected stats for the Control Center
 * @param  {Array[Operator]} ops: An array containing 1 to 5 operators
 */
export const getControlCenterStats = (ops) => {
    // As provided by the various operators
    let buffs = {
        // Only applicable to CC
        "morale_recovery": 0,
        // Yato alter, Noir Corne alter
        "factory_productivity_if_rathalos_in_cc": 0,
        "trading_post_productivity_if_kirin_in_cc": 0,
        "is_kirin_present": 0,
        "is_rathalos_present": 0,
        // Mlynar
        "smiley_count": 0,
        "morale_recovery_pp_hr_rr": 0,
        "recover_morale_for_others_from_smileys": 0,
        // Reed alter, Kestrel, Nymph
        "dorm_morale_recovery": 0,
        // Ascalon, Blaze Alter, Hoshiguma alter
        "specialization_training_speed": 0,
        // Ascalon, Amiya, Swire, Paprika
        "trading_post_productivity": 0,
        // Kal'tsit, Mon3tr
        "factory_productivity": 0,
        // Saileach
        "hire_speed_if_current_hire_speed_below_30": 0,
        // Civilight Eterna, Lee
        "clue_speed": 0,
        // Hoshiguma alter
        "factory_productivity_if_LGD_in_CC": 0,
        // Ch'en
        "morale_recovery_per_lungmen_department": 0,
        "lgd_operator_count": 0,
        // Rosa
        "morale_recovery_per_ursus_student": 0,
        "ursus_student_count": 0,
        // Gnosis
        "morale_recovery_per_karlan_trade": 0,
        "karlan_trade_operator_count": 0,
        // Kroos alter, Hibiscus alter, Lava alter
        "morale_recovery_per_alter": 0,
        "alter_operator_count": 0,
        // Wisadel, Chongyue
        "morale_recovery_others": 0,
        // Wisadel
        "morale_recovery_others_if_civilight_in_cc": 0,
        "is_civilight_in_cc": 0
    };

    for(let operator of ops){
        for(let skill of getActiveOperatorRiicSkills(operator)){
            if(!riicSkills[skill.buffId]){
                continue;
            }
            for(let effect of Object.keys(riicSkills[skill.buffId])){
                if(buffs[effect] !== undefined && skill.buffId.indexOf("control") === 0){
                    buffs[effect] += riicSkills[skill.buffId][effect];
                }
            }
        }
        /**
         * Innate bonuses
         * Each operator slotted will grant -0.05 MD to all facilities by default,
         * even if they don't have CC-related skills
         */
        buffs.morale_recovery += 0.05;
        buffs.morale_recovery_others += 0.05;

        if(lungmenGuardOperators.includes(operator.op_id)){
            buffs.lgd_operator_count += 1;
        }

        if(ursusStudentOperators.includes(operator.op_id)){
            buffs.ursus_student_count += 1;
        }

        if(karlanTradeOperators.includes(operator.op_id)){
            buffs.karlan_trade_operator_count += 1;
        }

        if(alterOperators.includes(operator.op_id)){
            buffs.alter_operator_count += 1;
        }
    }

    let moraleDrainCC = buffs.morale_recovery
        // Ch'en
        + buffs.morale_recovery_per_lungmen_department * buffs.lgd_operator_count
        // Rosa
        + buffs.morale_recovery_per_ursus_student * buffs.ursus_student_count
        // Gnosis
        + buffs.morale_recovery_per_karlan_trade * buffs.karlan_trade_operator_count
        // Alter
        + buffs.morale_recovery_per_alter * buffs.alter_operator_count
    ;

    let moraleDrainOthers = buffs.morale_recovery_others
      + buffs.recover_morale_for_others_from_smileys * buffs.smiley_count * 0.05
      + buffs.morale_recovery_others_if_civilight_in_cc * buffs.is_civilight_in_cc
    ;

    let moraleRecDorm = buffs.dorm_morale_recovery;
    let trainingSpeed = buffs.specialization_training_speed;
    let facPD = Math.max(
        buffs.factory_productivity,
        buffs.factory_productivity_if_LGD_in_CC * Math.min(buffs.lgd_operator_count, 1),
        buffs.factory_productivity_if_rathalos_in_cc * buffs.is_rathalos_present
    );
    let tpPD = Math.max(
        buffs.trading_post_productivity,
        buffs.trading_post_productivity_if_kirin_in_cc * buffs.is_kirin_present
    );
    let clueSpeed = buffs.clue_speed;

    return {
        "operator1": ops[0],
        "operator2": ops[1],
        "operator3": ops[2],
        "operator4": ops[3],
        "operator5": ops[4],
        "moraleDrainCC": moraleDrainCC,
        "moraleDrainOthers": roundTo(moraleDrainOthers, 2),
        "moraleRecDorm": moraleRecDorm,
        "trainingSpeed": trainingSpeed,
        "facPD": facPD,
        "tpPD": tpPD,
        "clueSpeed": clueSpeed
    };
};