import { Schema, Types, model } from 'mongoose';

const GroupScoreSchema = new Schema({
  groupId: {
    type: Types.ObjectId,
    required: true,
    ref: 'Group',
  },
  passing: {
    touchdowns: {
      type: Number,
      default: 4,
    },
    yards: {
      type: Number,
      default: 0.04,
    },
    interceptions: {
      type: Number,
      default: -2,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    completions: {
      type: Number,
      default: 0,
    },
    twoPointMade: {
      //2PT Pass
      type: Number,
      default: 2,
    },
    plays20Plus: {
      type: Number,
      default: 0,
    },
    plays40Plus: {
      type: Number,
      default: 0,
    },
  },
  rushing: {
    attempts: {
      type: Number,
      default: 0,
    },
    yards: {
      type: Number,
      default: 0.1,
    },
    touchdowns: {
      type: Number,
      default: 6,
    },
    plays20Plus: {
      type: Number,
      default: 0,
    },
    plays40Plus: {
      type: Number,
      default: 0,
    },
    fumbles: {
      type: Number,
      default: -2,
    },
    twoPointMade: {
      type: Number,
      default: 2,
    },
  },
  receiving: {
    targets: {
      type: Number,
      default: 0,
    },
    receptions: {
      type: Number,
      default: 0,
    },
    yards: {
      type: Number,
      default: 0.1,
    },
    touchdowns: {
      type: Number,
      default: 6,
    },
    plays20Plus: {
      type: Number,
      default: 0,
    },
    plays40Plus: {
      type: Number,
      default: 0,
    },
    fumbles: {
      type: Number,
      default: -2,
    },
    twoPointMade: {
      type: Number,
      default: 0,
    },
  },
  fumble: {
    fumblesLost: {
      type: Number,
      default: -2,
    },
  },
  fieldGoal: {
    made1_19: {
      type: Number,
      default: 2,
    },
    made20_29: {
      type: Number,
      default: 2,
    },
    made30_39: {
      type: Number,
      default: 2,
    },
    made40_49: {
      type: Number,
      default: 3,
    },
    made50Plus: {
      type: Number,
      default: 5,
    },
    extraPointMade: {
      type: Number,
      default: 1,
    },
  },
});

export default model('GroupScore', GroupScoreSchema);
