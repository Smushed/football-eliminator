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
    fgMade50Plus: 5
};


// Right now these are useless but I didn't want to just delete them
// passing: [`passTD`, `passYards`, `passInt`, `passAttempts`, `passCompletions`, `twoPtPassMade`],
// rushing: [`rushAttempts`, `rushYards`, `rushTD`, `rush20Plus`, `rush40Plus`, `rushFumbles`],
// receiving: [`targets`, `receptions`, `recYards`, `recTD`, `rec20Plus`, `rec40Plus`, `recFumbles`],
// fumbles: [`fumbles`],
// fieldGoals: [`fgMade1_19`, `fgMade20_29`, `fgmade30_39`, `fgMade40_49`, `fgMade50Plus`]