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
import evalCoreOperatorTp  from "./riicEvaluators/tradingPost/evalCoreOperatorTp.mjs";

import evalPozyGLP from "./riicEvaluators/tradingPost/evalPozyGLP.mjs";
import evalShamare from "./riicEvaluators/tradingPost/evalShamare.mjs";

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
            // Jaye gets special treatment as the only op who gets situational nerfs at E1
            if(operator.elite < assumePromotionLevel && operator.op_id !== JAYE_ID){
                operator.elite = parseInt(assumePromotionLevel);
                // We keep track of operators that have been upgraded for later
                upgradedOps.push(operator);
            }
        }
    }

    /***************************************************************
     ********** Evaluating combos and available operators **********
     ***************************************************************/

    // ========== SPECIAL ==========

    let piSrSquadScore = evalPiSr(roster, base, isMoraleMicro);
    console.log(piSrSquadScore);
    let wpSquadScore = evalWordlyPlight(roster, base, isMoraleMicro);
    console.log(wpSquadScore);
    let automationScore = evalAutomation(roster, base);
    console.log(automationScore);
    let pinusScore = evalPinusSylvestris(roster, base);
    console.log(pinusScore);
    let glasgowScore = evalGlasgow(roster, base);
    console.log(glasgowScore);
    let karlanScore = evalKarlanTrade(roster, base);
    console.log(karlanScore);
    let monhunScore = evalMonsterHunter(roster);
    console.log(monhunScore);
    let abyHuntScore = evalAbyssalHunters(roster);
    console.log(abyHuntScore);
    let jessBSWScore = evalBSW(roster);
    console.log(jessBSWScore);
    let dunMesScore = evalDungeonMeshi(roster, base);
    console.log(dunMesScore);
    let babelScore = evalBabel(roster);
    console.log(babelScore);
    let puddingScore = evalPudding(roster);
    console.log(puddingScore);

    // ========== FACTORY ==========

    // ---------- Teams ----------

    let vermeilScore = evalCoreOperatorFac(
        roster, base, VERMEIL_ID, vermeilBubbleTeamCandidates, 1
    );
    console.log(vermeilScore);
    let bubbleScore = evalCoreOperatorFac(
        roster, base, BUBBLE_ID, vermeilBubbleTeamCandidates, 1
    );
    console.log(bubbleScore);


    // ---------- Singles ----------

    // ========== TRADING POST ==========

    // ---------- Teams ----------
    let shamareScore = evalShamare(roster);
    console.log(shamareScore);
    let pozyGLPScore = evalPozyGLP(roster, base);
    console.log(pozyGLPScore);
    // If Jaye is currently E0, run an eval for both his E0 and E1 versions
    let e0JayeScore = { "isJayeUsed": false };
    let e1JayeScore = { "isJayeUsed": false };
    let jaye = roster[JAYE_ID];
    if(jaye?.elite === 0){
        e0JayeScore = evalCoreOperatorTp(
            roster, base, JAYE_ID, jayeCandidates, 0
        );
        jaye.elite = 1;
        e1JayeScore = evalCoreOperatorTp(
            roster, base, JAYE_ID, jayeCandidates, 1
        );
        jaye.elite = 0;
    // Otherwise just run it for E1
    }else if(jaye){
        e1JayeScore = evalCoreOperatorTp(
            roster, base, JAYE_ID, jayeCandidates, 1
        );
    }
    console.log(e0JayeScore);
    console.log(e1JayeScore);

    // TODO: Proviso

    // ---------- Singles ----------

    // ========== RECEPTION ROOM ==========

    // ---------- Teams ----------
    // Any team that requires both operators

    // ---------- Solos ----------
    // Any operator that requires the 2nd slot to be empty

    // ---------- Singles ----------

    // ========== POWER PLANT ==========

    // ========== HUMAN RESOURCES (OFFICE) ==========


    // ========== CONTROL CENTER ==========

    // TODO: Alter morale squad
    // TODO: Lee agency
    // TODO: Mlynar smiley squad


    /********************************************************************
     ********** Planning the rotations based on above findings **********
     ********************************************************************/
};