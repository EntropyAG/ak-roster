import { Operator } from "types/operators/operator";
import { Riic } from "types/riic";
import operators from "data/operators.json";

import evalAbyssalHunters  from "./riicEvaluators/special/evalAbyssalHunters.mjs";
import evalAutomation      from "./riicEvaluators/special/evalAutomation.mjs";
import evalBabel           from "./riicEvaluators/special/evalBabel.mjs";
import evalPiSr            from "./riicEvaluators/special/evalPiSr.mjs";
import evalPudding         from "./riicEvaluators/special/evalPudding.mjs";
import evalWordlyPlight    from "./riicEvaluators/special/evalWordlyPlight.mjs";

import evalCoreOperatorFac from "./riicEvaluators/factory/evalCoreOperatorFac.mjs";
import evalFacOperators    from "./riicEvaluators/factory/evalFacOperators.mjs";

import evalPozyGLP         from "./riicEvaluators/tradingPost/evalPozyGLP.mjs";
import evalShamare         from "./riicEvaluators/tradingPost/evalShamare.mjs";
import evalTpOperators     from "./riicEvaluators/tradingPost/evalTpOperators.mjs";

import evalRRTeams         from "./riicEvaluators/receptionRoom/evalRRTeams.mjs";

import evalPPTeams         from "./riicEvaluators/powerPlant/evalPPTeams.mjs";

import evalOfficeOps       from "./riicEvaluators/office/evalOfficeOps.mjs";

import evalCCTeams         from "./riicEvaluators/controlCenter/evalCCTeams.mjs";

import { vermeilBubbleTeamCandidates, bswOperators, robotOperators, rhineLabOperators } from "data/riic/operators";

const VERMEIL_ID = "char_190_clour";
const BUBBLE_ID = "char_381_bubble";

const MAX_ROTATION = 3;

const MAX_ELITE_PER_RARITY = {
    1: 0,
    2: 0,
    3: 1,
    4: 2,
    5: 2,
    6: 2
};

export const DEFAULT_FLAGS = {
    // Trading Post
    gnosisBuff: 0,
    inesInBase: 0,
    delphineInCC: 0,
    wInBase: 0,
    ulpianusInBase: 0,
    felvine: 0,
    // Factory
    hasVivianaBuff: 0,
    hasFlametailBuff: 0,
    hasJessicaAlterBuff: 0,
    hasJKinPP: 0,
    bswOpInBase: 0,
    robotsInPPCount: 0,
    isGummyInTP: 0,
    monsterMealCount: 0,
    // Reception Room
    isFiamInDorm: 0,
    isClueExchangeOngoing: 1,
    // Power Plant
    rhineOpsInBase: 0,
    isKaltsitInCC: 0,
    isLogosInTR: 0,
    // Office
    // Control Center
};

/**
  * Using a list of input operators and a base setup, sends back a 3-tiered rotation
  *
  * @param {Array[Operator]} operators: list of operators owned by the player, as imported
  * @param {Riic} base: Describes the base, including each facility level, type and product (if applicable)
  * @param {Integer} assumePromotionLevel: The promotion (elite) level operators will be forced to have
  * to ensure they have access to relevant skills.
  */
export const planify = (roster, base, assumePromotionLevel) => {
    let upgradedOps = [];
    if(assumePromotionLevel > 0){
        for(let operator of Object.values(roster)){
            let maxElite = MAX_ELITE_PER_RARITY[operators[operator.op_id].rarity];
            if(operator.elite < assumePromotionLevel && assumePromotionLevel <= maxElite){
                operator.elite = parseInt(assumePromotionLevel);
                // We keep track of operators that have been upgraded for later
                upgradedOps.push(operator);
            }
        }
    }

    let rotations = [];
    // Create the representation of each rotation
    for(let currRotation=0; currRotation<MAX_ROTATION; currRotation++){
        rotations.push({
            // Facilities (excluding dorms and production-oriented)
            controlCenter: { slots: 5, operators: [], level: 5 },
            receptionRoom: { slots: 2, operators: [], level: base.receptionRoom },
            office:        { slots: 1, operators: [], level: base.office },
            workshop:      { slots: 1, operators: [], level: base.workshop },
            trainingRoom:  { slots: 1, operators: [], level: base.trainingRoom },
            // Global flags - used to share modifiers between different facilities
            flags: DEFAULT_FLAGS
        });

        // Adding dorms
        for(let currDorm=0; currDorm<base.dorms.length; currDorm++){
            rotations[currRotation]["dorm"+currDorm] = { slots: 5, operators: [], level: base.dorms[currDorm] };
        }

        // Adding production facilities (power plant, factory, trading post)
        for(let currFacility=0; currFacility<base.production.length; currFacility++){
            rotations[currRotation]["prod"+currFacility] = {
                slots: base.production[currFacility].type === "PP" ? 1 : base.production[currFacility].level,
                operators: [],
                level:   base.production[currFacility].level,
                type:    base.production[currFacility].type,
                product: base.production[currFacility].product
            };
        }
    }

    for(let rotation of rotations){

        let currentRoster = structuredClone(roster);
        let phantomFlags = __fillInFlags(currentRoster, base);
        let flags = structuredClone(DEFAULT_FLAGS);

        /**
         * We do an initial evaluation with all the flags activated (phantom flags) to know the highest potential for all
         * teams/operators based on the current roster. Flags shoulds be activated in a separate variable when actually
         * slotting operators.
         */
        let scores = {
            // ========== SPECIAL ==========

            spl_piSrSquad: evalPiSr(currentRoster, base, phantomFlags),
            spl_wpSquad: evalWordlyPlight(currentRoster, base, phantomFlags),
            spl_automation: evalAutomation(currentRoster, base, phantomFlags),
            spl_abyHunt: evalAbyssalHunters(currentRoster),
            spl_babel: evalBabel(currentRoster),
            spl_pudding: evalPudding(currentRoster),

            // ========== FACTORY ==========

            fac_vermeil: evalCoreOperatorFac(currentRoster, base, phantomFlags, VERMEIL_ID, vermeilBubbleTeamCandidates, 1),
            fac_bubble: evalCoreOperatorFac(currentRoster, base, phantomFlags, BUBBLE_ID, vermeilBubbleTeamCandidates, 1),

            fac_singles: evalFacOperators(currentRoster, base, phantomFlags, 1),
            fac_pairs: evalFacOperators(currentRoster, base, phantomFlags, 2),
            fac_triplets: evalFacOperators(currentRoster, base, phantomFlags, 3),

            // ========== TRADING POST ==========

            tp_shamare: evalShamare(currentRoster),
            tp_pozyGLP: evalPozyGLP(currentRoster, base),

            tp_singles: evalTpOperators(currentRoster, base, phantomFlags, 1),
            tp_pairs: evalTpOperators(currentRoster, base, phantomFlags, 2),
            tp_triplets: evalTpOperators(currentRoster, base, phantomFlags, 3),

            // ========== RECEPTION ROOM ==========

            rr_squads: evalRRTeams(currentRoster, base, phantomFlags),

            // ========== POWER PLANT ==========

            pp_squads: evalPPTeams(currentRoster, base, phantomFlags),

            // ========== HUMAN RESOURCES (OFFICE) ==========

            hr_operators: evalOfficeOps(currentRoster, base),

            // ========== CONTROL CENTER ==========

            cc_operators: evalCCTeams(currentRoster, base),
        };

        console.log(scores);
        console.log(upgradedOps);

        /**
         * Initial evaluation done, starting to slot in operators based on the above scores. Global flags will
         * be set manually from now on.
         */



        // Operators in dorms are done first, since they provide effects while costing effectively nothing
        if(roster["char_4143_sensi"]?.elite === 2){
            flags.monsterMealCount = base.getHighestDormLevel();
        }
        // TODO: Senshi
        // TODO: Pozyomka (durins)
        // TODO: PI/SR - Virtuosa E0+, Czerny E2, Iris E2

        // CC flags
        // TODO: Delphine
        // TODO: Jessicat
        // TODO: Vivi / Flametail
        // TODO: Felvine

        break;

        /********************************************************************
         ********** Planning the rotations based on above findings **********
         ********************************************************************/

    }
};

/**
 * Quickly initializes all the flags based on the player's account.
 * Note that this is meant for a phantom use of the flags, which is to say only for an initial evaluation.
 * When actually slotting in the operators, flags should be turned on/off manually, instead of relying on
 * operators simply being there.
 * @param {*} roster
 */
const __fillInFlags = (roster, base) => {
    let flags = structuredClone(DEFAULT_FLAGS);

    // Trading Post
    if(roster["char_206_gnosis"]?.elite === 2){
        flags.gnosisBuff = 1;
    }

    if(roster["char_4087_ines"]){
        flags.inesInBase = 1;
    }

    if(roster["char_113_cqbw"]){
        flags.wInBase = 1;
    }

    if(roster["char_4110_delphn"]?.elite === 2){
        flags.delphineInCC = 1;
    }

    if(roster["char_4145_ulpia"]){
        flags.ulpianusInBase = 1;
    }

    // Fac + TP
    if(roster["char_1029_yato2"]){
        flags.felvine += 8;
    }

    if(roster["char_1030_noirc2"]){
        flags.felvine += 2;
        if(roster["char_1029_yato2"]){
            flags.felvine += 2;
        }
    }

    // Factory
    if(roster["char_4098_vvana"]?.elite === 2){
        flags.hasVivianaBuff = 1;
    }

    if(roster["char_420_flamtl"]?.elite === 2){
        flags.hasFlametailBuff = 1;
    }

    if(roster["char_1034_jesca2"]?.elite === 2){
        flags.hasJessicaAlterBuff = 1;
    }

    if(roster["char_4000_jnight"]){
        flags.hasJKinPP = 1;
    }

    for(let operator of bswOperators){
        if(roster[operator]){
            flags.bswOpInBase++;
        }
    }

    for(let operator of robotOperators){
        if(roster[operator] && flags.robotsInPPCount < base.getPowerPlantCount()){
            flags.robotsInPPCount++;
        }
    }

    if(roster["char_196_sunbr"]){
        flags.isGummyInTP = 1;
    }

    if(roster["char_4143_sensi"]?.elite === 2){
        flags.monsterMealCount = base.getHighestDormLevel();
    }

    // Reception Room
    if(roster["char_300_phenxi"]){
        flags.isFiamInDorm = 1;
    }

    flags.isClueExchangeOngoing =  1;

    // Power Plant
    for(let operator of rhineLabOperators){
        if(operator !== "char_249_mlyss" && roster[operator]){
            flags.rhineOpsInBase++;
        }
    }

    if(roster["char_003_kalts"]){
        flags.isKaltsitInCC = 1;
    }

    if(roster["char_4133_logos"]){
        flags.isLogosInTR = 1;
    }

    console.log("RETURNING PHANTOM FLAGS");
    console.log(flags);
    return flags;
};