const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const RosterSchema = new Schema({

    userID: { //This is who the roster belongs to
        type: String,
        unique: true,
        required: true
    },
    roster: {
        //This is going to be organized into blocks with the identifier being mySportID
        '2018-2019-regular': {
            '1': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '2': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '3': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '4': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '5': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '6': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '7': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '8': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '9': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '10': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '11': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '12': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '13': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '14': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '15': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '16': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '17': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            }
        },
        '2019-2020-regular': {
            '1': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '2': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '3': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '4': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '5': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '6': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '7': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '8': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '9': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '10': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '11': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '12': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '13': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '14': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '15': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '16': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            },
            '17': {
                QB: {
                    type: Number
                },
                RB1: {
                    type: Number
                },
                RB2: {
                    type: Number
                },
                WR1: {
                    type: Number
                },
                WR2: {
                    type: Number
                },
                Flex: {
                    type: Number
                },
                K: {
                    type: Number
                }
            }
        }
    }
});


module.exports = mongoose.model(`Roster`, RosterSchema);