const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const UsedPlayerSchema = new Schema({
  U: {
    //UserId
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  S: {
    //Season
    type: String,
    required: true,
  },
  G: {
    //GroupId
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  P: {
    //Position
    type: String,
    required: true,
  },
  UP: [Number], //Used Players (MySportsId)
});

module.exports = mongoose.model(`UsedPlayers`, UsedPlayerSchema);
