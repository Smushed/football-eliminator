import { Schema, model } from 'mongoose';

const PlayerStatsSchema = new Schema({
  mySportsId: {
    type: Number,
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
  passing: {
    touchdowns: {
      type: Number,
      default: 0,
    },
    yards: {
      type: Number,
      default: 0,
    },
    interceptions: {
      type: Number,
      default: 0,
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
      type: Number,
      default: 0,
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
      default: 0,
    },
    touchdowns: {
      type: Number,
      default: 0,
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
      default: 0,
    },
    twoPointMade: {
      type: Number,
      default: 0,
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
      default: 0,
    },
    touchdowns: {
      type: Number,
      default: 0,
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
      default: 0,
    },
    twoPointMade: {
      type: Number,
      default: 0,
    },
  },
  fumble: {
    fumblesLost: {
      type: Number,
      default: 0,
    },
  },
  fieldGoal: {
    made1_19: {
      type: Number,
      default: 0,
    },
    made20_29: {
      type: Number,
      default: 0,
    },
    made30_39: {
      type: Number,
      default: 0,
    },
    made40_49: {
      type: Number,
      default: 0,
    },
    made50Plus: {
      type: Number,
      default: 0,
    },
    extraPointMade: {
      type: Number,
      default: 0,
    },
  },
});

export default model('PlayerStats', PlayerStatsSchema);
