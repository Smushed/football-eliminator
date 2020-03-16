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
                T: 1
            }, {
                N: 'RB1',
                T: 2
            }, {
                N: 'RB2',
                T: 2
            }, {
                N: 'WR1',
                T: 3
            }, {
                N: 'WR2',
                T: 3
            }, {
                N: 'RB/WR',
                T: 7
            }, {
                N: 'TE',
                T: 4
            }, {
                N: 'K',
                T: 5
            }]
    },
});

module.exports = mongoose.model(`GroupRoster`, GroupRosterSchema);