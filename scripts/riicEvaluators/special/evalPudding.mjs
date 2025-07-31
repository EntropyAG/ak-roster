/**
 * Evaluate the player's roster to see whether it's viable to run PI/SR.
 * @param {Array[Operator]} operators: list of operators owned by the player, as imported
 * @param {Base} base: the base setup of the player
 * @returns {Object}: with "rosmonPD" and "ebenPD" and their respective productivity
 * given the other operators
 */
const evalPudding = (roster) => {
    let isPuddingUsed = false;
    let isFristonUsed = false;
    let isJKUsed = false;
    let isConfessUsed = false;
    let isPhonorUsed = false;
    let isCastle3Used = false;
    let isThrmXUsed = false;

    // We don't need to check for Amiya, since everyone has her and she only needs E0
    let pudding = roster["char_4004_pudd"];

    let friston = roster["char_4093_frston"];
    let jk = roster["char_4000_jnight"];
    let confess = roster["char_4188_confes"];
    let phonor = roster["char_4136_phonor"];
    let castle3 = roster["char_286_cast3"];
    let thrmx = roster["char_376_therex"];

    if(pudding && pudding.elite >= 1){
        isPuddingUsed = true;
    }

    if(friston) isFristonUsed = true;
    if(jk) isJKUsed = true;
    if(confess) isConfessUsed = true;
    if(phonor) isPhonorUsed = true;
    if(castle3) isCastle3Used = true;
    if(thrmx) isThrmXUsed = true;

    return {
        "isPuddingUsed": isPuddingUsed,
        "isFristonUsed": isFristonUsed,
        "isJKUsed": isJKUsed,
        "isConfessUsed": isConfessUsed,
        "isPhonorUsed": isPhonorUsed,
        "isCastle3Used": isCastle3Used,
        "isThrmXUsed": isThrmXUsed,
        "isLancetUsed": true
    };
};

export default evalPudding;