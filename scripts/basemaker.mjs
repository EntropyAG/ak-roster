import { Operator } from "types/operators/operator";
import { Riic } from "types/riic";
import operators from "data/operators.json";

import evalAbyssalHunters  from "./riicEvaluators/special/evalAbyssalHunters.mjs";
import evalAutomation      from "./riicEvaluators/special/evalAutomation.mjs";
import evalBabel           from "./riicEvaluators/special/evalBabel.mjs";
import evalDungeonMeshi    from "./riicEvaluators/special/evalDungeonMeshi.mjs";
import evalGlasgow         from "./riicEvaluators/special/evalGlasgow.mjs";
import evalKarlanTrade     from "./riicEvaluators/special/evalKarlanTrade.mjs";
import evalMonsterHunter   from "./riicEvaluators/special/evalMonsterHunter.mjs";
import evalPiSr            from "./riicEvaluators/special/evalPiSr.mjs";
import evalPinusSylvestris from "./riicEvaluators/special/evalPinusSylvestris.mjs";
import evalPudding         from "./riicEvaluators/special/evalPudding.mjs";
import evalWordlyPlight    from "./riicEvaluators/special/evalWordlyPlight.mjs";
import evalBSW             from "./riicEvaluators/special/evalBSW.mjs";

import evalCoreOperatorFac from "./riicEvaluators/factory/evalCoreOperatorFac.mjs";
import evalFacSingles      from "./riicEvaluators/factory/evalFacSingles.mjs";
import evalFacPairs        from "./riicEvaluators/factory/evalFacPairs.mjs";

import evalCoreOperatorTp  from "./riicEvaluators/tradingPost/evalCoreOperatorTp.mjs";
import evalPozyGLP         from "./riicEvaluators/tradingPost/evalPozyGLP.mjs";
import evalShamare         from "./riicEvaluators/tradingPost/evalShamare.mjs";
import evalTpSingles       from "./riicEvaluators/tradingPost/evalTpSingles.mjs";
import evalTpPairs         from "./riicEvaluators/tradingPost/evalTpPairs.mjs";

import evalRRTeams         from "./riicEvaluators/receptionRoom/evalRRTeams.mjs";

import evalPPTeams         from "./riicEvaluators/powerPlant/evalPPTeams.mjs";

import evalOfficeOps       from "./riicEvaluators/office/evalOfficeOps.mjs";

import evalCCTeams         from "./riicEvaluators/controlCenter/evalCCTeams.mjs";

import { vermeilBubbleTeamCandidates, jayeCandidates } from "data/riic/operators";

const VERMEIL_ID = "char_190_clour";
const BUBBLE_ID = "char_381_bubble";
const JAYE_ID = "char_272_strong";

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
    // TP
    gnosisBuff: 0,
    inesInBase: 0,
    wInBase: 0,
    ulpianusInBase: 0,
    // FAC
    hasVivianaBuff: 0,
    hasFlametailBuff: 0,
    hasJKinPP: 0,
    bswOpInBase: 0,
    robotsInPPCount: 0,
    isGummyInTP: 0,
    monsterMealCount: 0,
    // Reception Room
    isFiamInDorm: 0,
    isClueExchangeOngoing: 1,
    // Power Plant
    rhineOpsInBase: 3,
    isKaltsitInCC: 1,
    isLogosInTR: 1,
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
        /***************************************************************
         ********** Evaluating combos and available operators **********
         ***************************************************************/
        let scores = {
            // ========== SPECIAL ==========

            spl_piSrSquad: evalPiSr(currentRoster, base, rotation.flags),
            spl_wpSquad: evalWordlyPlight(currentRoster, base, rotation.flags),
            spl_automation: evalAutomation(currentRoster, base, rotation.flags),
            spl_pinus: evalPinusSylvestris(currentRoster, base, rotation.flags),
            spl_glasgow: evalGlasgow(currentRoster, base, rotation.flags),
            spl_karlan: evalKarlanTrade(currentRoster, base, rotation.flags),
            spl_monhun: evalMonsterHunter(currentRoster),
            spl_abyHunt: evalAbyssalHunters(currentRoster),
            spl_jessBSW: evalBSW(currentRoster),
            spl_dunMes: evalDungeonMeshi(currentRoster, base, rotation.flags),
            spl_babel: evalBabel(currentRoster),
            spl_pudding: evalPudding(currentRoster),

            // ========== FACTORY ==========

            fac_vermeil: evalCoreOperatorFac(currentRoster, base, rotation.flags, VERMEIL_ID, vermeilBubbleTeamCandidates, 1),
            fac_bubble: evalCoreOperatorFac(currentRoster, base, rotation.flags, BUBBLE_ID, vermeilBubbleTeamCandidates, 1),

            fac_pairs: evalFacPairs(currentRoster, base, rotation.flags),
            fac_singles: evalFacSingles(currentRoster, base, rotation.flags),

            // ========== TRADING POST ==========

            tp_shamare: evalShamare(currentRoster),
            tp_pozyGLP: evalPozyGLP(currentRoster, base),
            tp_e0Jaye: evalCoreOperatorTp(currentRoster, base, rotation.flags, JAYE_ID, jayeCandidates, 0, 0),
            tp_e1Jaye: evalCoreOperatorTp(currentRoster, base, rotation.flags, JAYE_ID, jayeCandidates, 1),

            tp_singles: evalTpSingles(currentRoster, base, rotation.flags),
            tp_pairs: evalTpPairs(currentRoster, base, rotation.flags),

            // ========== RECEPTION ROOM ==========

            rr_squads: evalRRTeams(currentRoster, base, rotation.flags),

            // ========== POWER PLANT ==========

            pp_squads: evalPPTeams(currentRoster, base, rotation.flags),

            // ========== HUMAN RESOURCES (OFFICE) ==========

            hr_operators: evalOfficeOps(currentRoster, base),

            // ========== CONTROL CENTER ==========

            cc_operators: evalCCTeams(currentRoster, base),
        };
        console.log(scores);
        console.log(upgradedOps);

        break;

        /********************************************************************
         ********** Planning the rotations based on above findings **********
         ********************************************************************/

    }
};