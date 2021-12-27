const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const IdealRosterSchema = new Schema({

    G: { //GroupId
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
    },
    W: { //Week
        type: Number,
        required: true,
    },
    S: { //Season
        type: String,
        required: true,
        trim: true
    },
    R: [ //Roster
        {
            M: { //MySportsId
                type: Number,
                required: true,
                default: 0
            },
            SC: { //Score
                type: Number,
                required: true,
                default: 0
            },
            _id: false
        }
    ]
});


module.exports = mongoose.model(`IdealRoster`, IdealRosterSchema);