const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const PlayerDataSchema = new Schema({
  N: {
    //Name
    type: String,
    required: true,
    trim: true,
  },
  M: {
    //mySportsId
    type: Number,
    required: true,
  },
  T: {
    //Team
    type: String,
    default: `UNK`,
    trim: true,
  },
  P: {
    //Position
    type: String,
    default: `UNK`,
  },
  A: Boolean, //Active
  R: Number, //Rank
  I: {
    //Injury
    type: {
      D: String,
      PP: String,
    },
  },
  E: {
    //Espn ID
    type: Number,
    default: 0,
  },
  AV: {
    //Avatar
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model(`PlayerData`, PlayerDataSchema);
