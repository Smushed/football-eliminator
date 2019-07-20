const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const UserRosterSchema = new Schema({

    userId: { //This is who the roster belongs to
        type: String,
        unique: true,
        required: true
    },
    roster: {
        //This is going to be organized into blocks with the identifier being mySportID
        '2019-2020-regular': {
            usedPlayers: [Number],
            '1': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '2': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '3': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '4': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '5': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '6': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '7': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '8': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '9': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '10': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '11': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '12': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '13': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '14': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '15': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '16': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            },
            '17': {
                QB: {
                    type: Number,
                    default: 0
                },
                RB1: {
                    type: Number,
                    default: 0
                },
                RB2: {
                    type: Number,
                    default: 0
                },
                WR1: {
                    type: Number,
                    default: 0
                },
                WR2: {
                    type: Number,
                    default: 0
                },
                Flex: {
                    type: Number,
                    default: 0
                },
                TE: {
                    type: Number,
                    default: 0
                },
                K: {
                    type: Number,
                    default: 0
                }
            }
        }
    }
});


module.exports = mongoose.model(`UserRoster`, UserRosterSchema);