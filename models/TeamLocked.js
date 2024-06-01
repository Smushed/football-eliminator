import { Schema, model } from 'mongoose';

const TeamLockedSchema = new Schema({
  team: {
    type: String,
    required: true,
    trim: true,
  },
  startingTime: {
    type: Date,
    required: true,
  },
  week: {
    type: Number,
    required: true,
  },
  season: {
    type: String,
    required: true,
    trim: true,
  },
});

export default model('TeamLocked', TeamLockedSchema);
