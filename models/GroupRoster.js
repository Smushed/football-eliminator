const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

//Everything is to be singular
const GroupRosterSchema = new Schema({
    G: { //GroupId
        type: String,
        unique: true,
        required: true
    },
    P: { //Positions
        type: Array,
        default: [
            {
                N: 'QB',
                I: 0
            }, {
                N: 'RB1',
                I: 1
            }, {
                N: 'RB2',
                I: 1
            }, {
                N: 'WR1',
                I: 2
            }, {
                N: 'WR2',
                I: 2
            }, {
                N: 'RB/WR',
                I: 6
            }, {
                N: 'TE',
                I: 3
            }, {
                N: 'K',
                I: 4
            }]
    },
});

module.exports = mongoose.model(`GroupRoster`, GroupRosterSchema);