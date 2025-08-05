export const tpOrders = {
    tp1weights:{
        0: [1, 0,  0],  // default
        1: [1, 0,  0], // 1x slight increase
        2: [1, 0,  0], // 2x slight increase
        3: [1, 0,  0]  // 1x increase (or more)
    },
    // Probability of getting a low/med/high yield in this order, depending on tailoring skill
    // Nota: these are NOT the real values, these simply have not been investigated sufficiently
    // there is no reason to ever use Tailoring on a lvl 2 TP for the time being, hence why
    // it needs further investigation
    tp2weights:{
        0: [0.6, 0.4,  0],  // default
        1: [0.6, 0.4,  0], // 1x slight increase
        2: [0.6, 0.4,  0], // 2x slight increase
        3: [0.6, 0.4,  0]  // 1x increase (or more)
    },
    // Probability of getting a low/med/high yield in this order, depending on tailoring skill
    tp3weights:{
        0: [0.3,  0.5,  0.2],  // default
        1: [0.15, 0.3,  0.55], // 1x slight increase
        2: [0.13, 0.22, 0.65], // 2x slight increase
        3: [0.05, 0.1,  0.85]  // 1x increase (or more)
    },
    // Average value of a 4-bar order depending on Tequila's skill
    goldValues:{
        0: 500,
        1: 562.5,
        2: 625
    },
    // Time in minutes for each number of gold bar count, excluding any %PD modifications
    time:{
        2: 144,
        3: 210,
        4: 276
    }
};

// Baseline used to estimate the productivity of teams modifying orders (Tequila, Proviso, Tailoring buff)
export const tpDailyLmd = {
    0: 10000,
    1: 10140.84507,
    2: 10265.48673
};