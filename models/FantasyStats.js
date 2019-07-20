const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const FantasyStatsSchema = new Schema({
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    mySportsId: {
        type: Number,
    },
    team: {
        id: {
            type: Number
        },
        abbreviation: {
            type: String,
            default: `UNK`,
            trim: true
        },
    },
    position: {
        type: String,
        default: `UNK`
    },
    active: Boolean,
    stats: {
        '2018-2019-regular': {
            '1': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '2': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '3': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '4': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '5': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '6': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '7': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '8': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '9': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '10': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '11': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '12': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '13': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '14': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '15': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '16': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '17': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            }
        },
        '2019-2020-regular': {
            '1': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '2': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '3': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '4': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '5': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '6': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '7': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '8': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '9': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '10': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '11': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '12': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '13': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '14': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '15': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '16': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            },
            '17': {
                passing: {
                    passTD: {
                        type: Number,
                        default: 0
                    },
                    passYards: {
                        type: Number,
                        default: 0
                    },
                    passInt: {
                        type: Number,
                        default: 0
                    },
                    passAttempts: {
                        type: Number,
                        default: 0
                    },
                    passCompletions: {
                        type: Number,
                        default: 0
                    },
                    twoPtPassMade: {
                        type: Number,
                        default: 0
                    },
                },
                rushing: {
                    rushAttempts: {
                        type: Number,
                        default: 0
                    },
                    rushYards: {
                        type: Number,
                        default: 0
                    },
                    rushTD: {
                        type: Number,
                        default: 0
                    },
                    rush20Plus: {
                        type: Number,
                        default: 0
                    },
                    rush40Plus: {
                        type: Number,
                        default: 0
                    },
                    rushFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                receiving: {
                    targets: {
                        type: Number,
                        default: 0
                    },
                    receptions: {
                        type: Number,
                        default: 0
                    },
                    recYards: {
                        type: Number,
                        default: 0
                    },
                    recTD: {
                        type: Number,
                        default: 0
                    },
                    rec20Plus: {
                        type: Number,
                        default: 0
                    },
                    rec40Plus: {
                        type: Number,
                        default: 0
                    },
                    recFumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fumbles: {
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                    fumbles: {
                        type: Number,
                        default: 0
                    },
                },
                fieldGoals: {
                    fgMade1_19: {
                        type: Number,
                        default: 0
                    },
                    fgMade20_29: {
                        type: Number,
                        default: 0
                    },
                    fgmade30_39: {
                        type: Number,
                        default: 0
                    },
                    fgMade40_49: {
                        type: Number,
                        default: 0
                    },
                    fgMade50Plus: {
                        type: Number,
                        default: 0
                    },
                }
            }
        }
    }
});

module.exports = mongoose.model(`FantasyStats`, FantasyStatsSchema);