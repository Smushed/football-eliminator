const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

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
                N: 'RB',
                I: 1
            }, {
                N: 'RB',
                I: 1
            }, {
                N: 'WR',
                I: 2
            }, {
                N: 'WR',
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