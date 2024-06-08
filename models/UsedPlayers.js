import { Schema, Types, model } from 'mongoose';

const UsedPlayerSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  season: {
    type: String,
    required: true,
  },
  groupId: {
    type: Types.ObjectId,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  usedPlayers: [Number],
});

export default model('UsedPlayers', UsedPlayerSchema);
