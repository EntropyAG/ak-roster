/**
 * Evaluate the player's roster to see whether it's viable to run PI/SR.
 * @param {Array[Operator]} operators: list of operators owned by the player, as imported
 * @param {Base} base: the base setup of the player
 * @returns {Object}: with "rosmonPD" and "ebenPD" and their respective productivity
 * given the other operators
 */
const evalDungeonMeshi = (roster, base) => {
    let isSenshiUsed = false;
    let isMarcilleUsed = false;
    let isLaiosUsed = false;
    let isChilchuckUsed = false;
    let monsterMeal = 0;
    let laiosSpeedRR = 0;
    let chilchuckTP = 0;
    let marcilleFAC = 0;

    let senshi = roster["char_4143_sensi"];
    let marcille = roster["char_4141_marcil"];
    let laios = roster["char_4142_laios"];
    let chilchuck = roster["char_4144_chilc"];

    if(senshi && senshi.elite === 2){
        isSenshiUsed = true;
        monsterMeal = base.getHighestDormLevel();
    }

    // Laios
    if(laios){
        isLaiosUsed = true;
        laiosSpeedRR = 29; // 5% innate + 20% base + 4% from rarity
        // + 0/8/16% based on promotion level
        if(laios.elite === 1){
            laiosSpeedRR += 8;
        }else if(laios.elite === 2){
            laiosSpeedRR += 16;
            laiosSpeedRR += (monsterMeal * 2);
        }
    }

    // Marcille
    // FAC 20% base (E0) or 30% (E2), +1% per monster meal
    if(marcille){
        isMarcilleUsed = true;
        marcilleFAC = 20;
        if(marcille.elite === 2){
            marcilleFAC += 10;
            marcilleFAC += monsterMeal;
        }
    }

    // Chilchuck
    // TP 30% (+1 cap but w/e) and +1% per monster meal
    if(chilchuck){
        isChilchuckUsed = true;
        chilchuckTP = 30;
        if(chilchuck.elite === 2){
            chilchuckTP += monsterMeal;
        }
    }

    return {
        "isSenshiUsed": isSenshiUsed,
        "isLaiosUsed": isLaiosUsed,
        "isMarcilleUsed": isMarcilleUsed,
        "isChilchuckUsed": isChilchuckUsed,
        "monsterMeal": monsterMeal,
        "laiosSpeedRR": laiosSpeedRR,
        "chilchuckTP": chilchuckTP,
        "marcilleFAC": marcilleFAC
    };
};

export default evalDungeonMeshi;