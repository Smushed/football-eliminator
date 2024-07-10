import { Schema, model } from 'mongoose';

const PlayerDataSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mySportsId: {
    type: Number,
    required: true,
    unique: true,
  },
  team: {
    type: String,
    default: 'UNK',
    trim: true,
  },
  position: {
    type: String,
    default: 'UNK',
  },
  active: Boolean,
  rank: { type: Number, required: true, default: 8 },
  injury: {
    type: {
      description: String,
      playingProbability: String,
    },
  },
  espnId: {
    type: Number,
    default: 0,
  },
  avatar: {
    type: Boolean,
    default: false,
  },
});

export default model('PlayerData', PlayerDataSchema);
