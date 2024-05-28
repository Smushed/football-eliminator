import { Schema, Types, model } from 'mongoose';

const UsedPlayerSchema = new Schema({
  U: {
    //UserId
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  S: {
    //Season
    type: String,
    required: true,
  },
  G: {
    //GroupId
    type: Types.ObjectId,
    required: true,
  },
  P: {
    //Position
    type: String,
    required: true,
  },
  UP: [Number], //Used Players (MySportsId)
});

export default model('UsedPlayers', UsedPlayerSchema);
