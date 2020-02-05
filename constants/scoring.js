module.exports = {
    buckets: [`P`, `RU`, `RE`, `F`, `FG`],
    passTD: 4,
    passYards: 0.04, //1 for every 25 yards
    passInt: -2,
    passAttempts: 0,
    passCompletions: 0,
    twoPtPassMade: 2,
    rushAttempts: 00,
    rushYards: 0.01,
    rushTD: 6,
    rush20Plus: 0, //These aren't for TD they are only for long rush
    rush40Plus: 0,
    rushFumbles: 0, //This includes fumbles NOT lost
    targets: 0,
    receptions: 0,
    recYards: 0.1,
    recTD: 6,
    rec20Plus: 0,
    rec40Plus: 0,
    recFumbles: 0,
    fumbles: -2,
    fgMade1_19: 2, //I need to have extra points added
    fgMade20_29: 2,
    fgMade30_39: 2,
    fgMade40_49: 3,
    fgMade50Plus: 5,
    P: {//Passing
        T: 4, //TD
        Y: 0.04, //Pass Yards
        I: -2, //Int
        A: 0, //Attempts
        C: 0, //Completions
        '2P': 2 //2PtPass
    },
    RU: { //Rushing
        A: 0, //Attempts
        Y: 0.01, //Rush Yards
        T: 6, //TD
        '20': 0, //20Plus Rush
        '40': 0, //40 Plus Rush
        'F': 0, //Fumbles
        '2P': 0 //2PT Rush
    },
    RE: {
        TA: 0, //Targets
        R: 0, //Receptions
        Y: 0.1, //Rec Yards
        T: 6, //TD 
        '20': 0, //20 Plus Rec
        '40': 0, //40 Plus Rec
        F: -2, //Rec Fumble
        '2P': 0 //2PT Rec
    },
    F: {
        F: -2 //Fumble
    },
    FG: {
        1: 2, //1-19 FG 
        20: 2, //20-29 FG 
        30: 2, //30-39 FG 
        40: 3, //40-49 FG 
        50: 5, //50 plus FG 
        'X': 1//Extra Point}
    }
};