export const tpOrders = {
    // Probability of getting a low/med/high yield in this order, depending on tailoring skill
    weights:{
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

// Baseline used to estimate the productivity of a Shamare team
export const tpDailyLmd = {
    0: 10000,
    1: 10110,
    2: 10265
};