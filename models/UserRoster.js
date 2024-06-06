import { Schema, Types, model } from 'mongoose';

const UserRosterSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  groupId: {
    type: Types.ObjectId,
    required: true,
    ref: 'Group',
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
      mySportsId: {
        type: Number,
        required: true,
        default: 0,
      },
      score: {
        //Score
        type: Number,
        required: true,
        default: 0,
      },
      _id: false,
    },
  ],
});

UserRosterSchema.index(
  {
    userId: 1,
    groupId: -1,
    week: -1,
    season: -1,
  },
  {
    unique: true,
  }
);

export default model('UserRoster', UserRosterSchema);
