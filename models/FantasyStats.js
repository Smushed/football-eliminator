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
    stats: {
        '2018-2019-regular': {
            '1': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '2': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '3': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '4': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '5': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '6': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '7': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '8': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '9': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '10': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '11': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '12': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '13': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '14': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '15': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '16': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            },
            '17': {
                passing: {
                    passTD: Number,
                    passYards: Number,
                    passInt: Number,
                    passAttempts: Number,
                    passCompletions: Number,
                    twoPtPassMade: Number,
                },
                rushing: {
                    rushAttempts: Number,
                    rushYards: Number,
                    rushTD: Number,
                    rush20Plus: Number,
                    rush40Plus: Number,
                    rushFumbles: Number,
                },
                receiving: {
                    targets: Number,
                    receptions: Number,
                    recYards: Number,
                    recTD: Number,
                    rec20Plus: Number,
                    rec40Plus: Number,
                    recFumbles: Number,
                },
                fumbles: {
                    fumbles: Number,
                    fumbles: Number,
                },
                fieldGoals: {
                    fgMade1_19: Number,
                    fgMade20_29: Number,
                    fgmade30_39: Number,
                    fgMade40_49: Number,
                    fgMade50Plus: Number,
                }
            }
        }
    }
});

module.exports = mongoose.model(`FantasyStats`, FantasyStatsSchema);