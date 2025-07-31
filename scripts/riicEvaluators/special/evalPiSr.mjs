/**
 * Evaluate the player's roster to see whether it's viable to run PI/SR.
 * @param {Array[Operator]} operators: list of operators owned by the player, as imported
 * @param {Base} base: the base setup of the player
 * @returns {Object}: with "rosmonPD" and "ebenPD" and their respective productivity
 * given the other operators
 */
const evalPiSr = (roster, base, isMoraleMicro) => {
    let totalPI = 0;
    let totalSR = 0;
    let useDusk = false;
    let useLing = false;
    let useWhisperain = false;
    let useSaileach = false;
    let useArturia = false;
    let useCzerny = false;
    let useIris = false;

    // Dusk & Ling require micromanaging their morale for PI generation, so skip if the player doesn't want to
    if (isMoraleMicro) {
        let ling = roster["char_2023_ling"];
        let dusk = roster["char_2015_dusk"];
        if (ling && ling.elite === 2) {
            useLing = true;
            totalPI += 10;
        }

        if (dusk) {
            useDusk = true;
            totalPI += 10;
        }
    }

    // Next to see if we can add Whisperain (and possibly Saileach) to generate more PI
    let whisperain = roster["char_436_whispr"];
    if (whisperain && whisperain.elite === 2) {
        if (base.office === 2) {
            totalPI += 10;
            useWhisperain = true;
        } else if (base.office === 3) {
            totalPI += 20;
            useWhisperain = true;
        }

        let saileach = roster["char_479_sleach"];
        if (useWhisperain && saileach && saileach.elite === 2) {
            useSaileach = true;
        }
    }

    // Now to see how much SR/PI we get from dorms
    let arturia = roster["char_245_cello"];
    let czerny = roster["char_4047_pianst"];
    let iris = roster["char_338_iris"];
    if (arturia) {
        totalSR += 5;
        useArturia = true;
    }
    if (czerny && czerny.elite === 2) {
        totalPI += base.getHighestDormLevel();
        useCzerny = true;
    }
    if (iris && iris.elite === 2) {
        totalPI += base.getHighestDormLevel();
        useIris = true;
    }

    // Now for Roscat & Eben, first we take into account their first skill
    let rosmontis = roster["char_391_rosmon"];
    let ebenholz = roster["char_4046_ebnhlz"];
    if (rosmontis) {
        totalPI += 20;
    }
    if (ebenholz) {
        totalPI += 20;
        if (ebenholz.elite === 2) {
            totalSR += Math.floor(totalPI / 2);
        } else {
            totalSR += Math.floor(totalPI / 4);
        }
    }

    return {
        "rosmonPD": rosmontis ? totalPI : 0,
        "ebenPD": ebenholz ? totalSR : 0,
        "useWhisperain": useWhisperain,
        "useSaileach": useSaileach,
        "useArturia": useArturia,
        "useCzerny": useCzerny,
        "useIris": useIris,
        "useDusk": useDusk,
        "useLing": useLing,
    };
};

export default evalPiSr;