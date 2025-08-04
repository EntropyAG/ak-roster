import { Operator } from "types/operators/operator";

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

import evalOfficeOps       from "./riicEvaluators/office/evalOfficeOps.mjs";

import { vermeilBubbleTeamCandidates, jayeCandidates } from "data/riic/operators";

const VERMEIL_ID = "char_190_clour";
const BUBBLE_ID = "char_381_bubble";
const JAYE_ID = "char_272_strong";

/**
  * Using a list of input operators and a base setup, sends back a 3-tiered rotation
  *
  * @param {Array[Operator]} operators: list of operators owned by the player, as imported
  * @param {Object} setup: object with 4 properties indicating the number and levels of FAC/TPs
  * @param {Boolean} isMoraleMicro: true if the player is willing to micromanage the morale of specific
  * operators, such as Dusk / Ling in a PI combo or some workshop operators requiring those in dorm to have
  * a morale below a certain threshold
  * @param {Integer} assumePromotionLevel: The promotion (elite) level operators will be forced to have
  * to ensure they have access to relevant skills.
  */
export const planify = (roster, base, isMoraleMicro, assumePromotionLevel) => {
    let upgradedOps = [];
    if(assumePromotionLevel > 0){
        for(let operator of Object.values(roster)){
            if(operator.elite < assumePromotionLevel){
                operator.elite = parseInt(assumePromotionLevel);
                // We keep track of operators that have been upgraded for later
                upgradedOps.push(operator);
            }
        }
    }

    /***************************************************************
     ********** Evaluating combos and available operators **********
     ***************************************************************/

    let scores = {
        // ========== SPECIAL ==========
        spl_piSrSquad: evalPiSr(roster, base, isMoraleMicro),
        spl_wpSquad: evalWordlyPlight(roster, base, isMoraleMicro),
        spl_automation: evalAutomation(roster, base),
        spl_pinus: evalPinusSylvestris(roster, base),
        spl_glasgow: evalGlasgow(roster, base),
        spl_karlan: evalKarlanTrade(roster, base),
        spl_monhun: evalMonsterHunter(roster),
        spl_abyHunt: evalAbyssalHunters(roster),
        spl_jessBSW: evalBSW(roster),
        spl_dunMes: evalDungeonMeshi(roster, base),
        spl_babel: evalBabel(roster),
        spl_pudding: evalPudding(roster),

        // ========== FACTORY ==========

        fac_vermeil: evalCoreOperatorFac(roster, base, VERMEIL_ID, vermeilBubbleTeamCandidates, 1),
        fac_bubble: evalCoreOperatorFac(roster, base, BUBBLE_ID, vermeilBubbleTeamCandidates, 1),

        fac_pairs: evalFacPairs(roster, base),
        fac_singles: evalFacSingles(roster, base),

        // ========== TRADING POST ==========

        // ---------- Teams ----------
        tp_shamare: evalShamare(roster),
        tp_pozyGLP: evalPozyGLP(roster, base),
        tp_e0Jaye: evalCoreOperatorTp(roster, base, JAYE_ID, jayeCandidates, 0, 0),
        tp_e1Jaye: evalCoreOperatorTp(roster, base, JAYE_ID, jayeCandidates, 1),

        tp_singles: evalTpSingles(roster, base),
        tp_pairs: evalTpPairs(roster, base),

        // ========== RECEPTION ROOM ==========

        rr_squads: evalRRTeams(roster, base),

        // ========== POWER PLANT ==========

        // ========== HUMAN RESOURCES (OFFICE) ==========

        hr_operators: evalOfficeOps(roster, base),

        // ========== CONTROL CENTER ==========

        // TODO: Alter morale squad
        // TODO: Lee agency
        // TODO: Mlynar smiley squad
    };
    console.log(scores);
    console.log(upgradedOps);

    /********************************************************************
     ********** Planning the rotations based on above findings **********
     ********************************************************************/
};