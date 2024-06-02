import { Schema, Types, model } from 'mongoose';

const IdealRosterSchema = new Schema({
  groupId: {
    type: Types.ObjectId,
    ref: 'Group',
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
  roster: [
    {
      mySportId: {
        type: Number,
        required: true,
        default: 0,
      },
      score: {
        type: Number,
        required: true,
        default: 0,
      },
      _id: false,
    },
  ],
});

IdealRosterSchema.index(
  {
    groupId: -1,
    week: -1,
    season: -1,
  },
  {
    unique: true,
  }
);

export default model('IdealRoster', IdealRosterSchema);
