/**
 * Evaluate the player's roster to see whether it's viable to run PI/SR.
 * @param {Array[Operator]} operators: list of operators owned by the player, as imported
 * @param {Base} base: the base setup of the player
 * @returns {Object}: with "rosmonPD" and "ebenPD" and their respective productivity
 * given the other operators
 */
const evalWordlyPlight = (roster, base) => {
    let totalWP = 0;
    let useDusk = false;
    let useLing = false;
    let useMulberry = false;
    let useSaileach = false;
    let useMrNothing = false;
    let useChongyue = false;
    let useNian = false;
    let useShu = false;
    let useYu = false;
    let useJieyun = false;
    let suiCount = 0;

    // Dusk & Ling require micromanaging their morale for PI generation, so skip if the player doesn't want to
    let ling = roster["char_2023_ling"];
    let dusk = roster["char_2015_dusk"];
    if (ling && ling.elite === 2) {
        useLing = true;
        totalWP += 15;
    }

    if (dusk) {
        useDusk = true;
        totalWP += 15;
    }

    // Next to see if we can add Mulberry (and possibly Saileach) to generate more PI
    let mulberry = roster["char_473_mberry"];
    if (mulberry && mulberry.elite === 2) {
        if (base.office === 2) {
            totalWP += 10;
            useMulberry = true;
        } else if (base.office === 3) {
            totalWP += 20;
            useMulberry = true;
        }

        let saileach = roster["char_479_sleach"];
        if (useMulberry && saileach && saileach.elite === 2) {
            useSaileach = true;
        }
    }

    // Mr. Nothing. Only the WP part, the productivity is at the end
    let mrNothing = roster["char_455_nothin"];
    if (mrNothing && mrNothing.elite === 2) {
        totalWP += 20;
        useMrNothing = true;
    }

    // On to Chungus... We have to count how many Sui siblings can be put in the base
    let chongyue = roster["char_2024_chyue"];
    let nian = roster["char_2014_nian"];
    let shu = roster["char_2025_shu"];
    let yu = roster["char_2026_yu"];
    if (chongyue) {
        useChongyue = true;
        suiCount++;
        if (nian) {
            useNian = true;
            suiCount++;
        }

        if (shu) {
            useShu = true;
            suiCount++;
        }

        if (yu) {
            useYu = true;
            suiCount++;
        }

        if (useDusk) {
            suiCount++;
        }

        if (useLing) {
            suiCount++;
        }

        // Chongyue's skill is capped at 5 siblings
        totalWP += Math.min(suiCount * 5, 25);
    }

    // Separate check for Shu that doesn't depend on Chungus, since she can provide FAC productivity with WP
    if (shu && shu.elite === 2) {
        useShu = true;
    }

    // Jieyun check, even at E0 there is some productivity, tho it's not really worth really
    let jieyun = roster["char_4078_bdhkgt"];
    let jieyunPD = 0;
    if (jieyun) {
        useJieyun = true;
        jieyunPD = Math.floor(totalWP / 5);
        if (jieyun.elite === 2) {
            jieyunPD = Math.floor(totalWP / 5) * 2;
        }
    }

    return {
        "totalWP": totalWP,
        "useDusk": useDusk,
        "useLing": useLing,
        "useMulberry": useMulberry,
        "useSaileach": useSaileach,
        "useMrNothing": useMrNothing,
        "useNian": useNian,
        "useChongyue": useChongyue,
        "useShu": useShu,
        "useYu": useYu,
        "useJieyun": useJieyun,
        "mrNothingPD": useMrNothing ? totalWP : 0,
        "jieyunPD": useJieyun ? jieyunPD : 0,
        "shuPD": useShu ? Math.floor(totalWP / 3) : 0,
    };
};

export default evalWordlyPlight;