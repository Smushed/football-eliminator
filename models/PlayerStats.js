import { Schema, model } from 'mongoose';

const PlayerStatsSchema = new Schema({
  M: {
    //mySportsId
    type: Number,
    required: true,
  },
  W: {
    //Week
    type: Number,
    required: true,
  },
  S: {
    //Season
    type: String,
    required: true,
    trim: true,
  },
  P: {
    //Passing
    T: {
      //PassTD
      type: Number,
      default: 0,
    },
    Y: {
      //PassYards
      type: Number,
      default: 0,
    },
    I: {
      //PassInt
      type: Number,
      default: 0,
    },
    A: {
      //PassAttempts
      type: Number,
      default: 0,
    },
    C: {
      //PassCompletions
      type: Number,
      default: 0,
    },
    '2P': {
      //TwoPtPassMade
      type: Number,
      default: 0,
    },
    20: {
      //20Plus Passes
      type: Number,
      default: 0,
    },
    40: {
      //40 Plus Passes
      type: Number,
      default: 0,
    },
  },
  RU: {
    //Rushing
    A: {
      //RushingAttempts
      type: Number,
      default: 0,
    },
    Y: {
      //RushingYards
      type: Number,
      default: 0,
    },
    T: {
      //RushingTD
      type: Number,
      default: 0,
    },
    20: {
      //Rushing20Plus
      type: Number,
      default: 0,
    },
    40: {
      //Rushing40Plus
      type: Number,
      default: 0,
    },
    F: {
      //RushingFumbles
      type: Number,
      default: 0,
    },
    '2P': {
      //twoPtRushMade
      type: Number,
      default: 0,
    },
  },
  RE: {
    //Receiving
    TA: {
      //ReceivingTargets
      type: Number,
      default: 0,
    },
    R: {
      //ReceivingReceptions
      type: Number,
      default: 0,
    },
    Y: {
      //ReceivingYards
      type: Number,
      default: 0,
    },
    T: {
      //ReceivingTD
      type: Number,
      default: 0,
    },
    20: {
      //Receiving20Plus
      type: Number,
      default: 0,
    },
    40: {
      //Receiving40Plus
      type: Number,
      default: 0,
    },
    F: {
      //ReceivingFumbles
      type: Number,
      default: 0,
    },
    '2P': {
      //twoPtReceivingMade
      type: Number,
      default: 0,
    },
  },
  F: {
    //FumblesLost
    F: {
      type: Number,
      default: 0,
    },
  },
  FG: {
    //FieldGoals
    1: {
      //1-19
      type: Number,
      default: 0,
    },
    20: {
      //20-29
      type: Number,
      default: 0,
    },
    30: {
      //30-39
      type: Number,
      default: 0,
    },
    40: {
      //40-49
      type: Number,
      default: 0,
    },
    50: {
      //50+
      type: Number,
      default: 0,
    },
    X: {
      //extraPointMade
      type: Number,
      default: 0,
    },
  },
});

export default model('PlayerStats', PlayerStatsSchema);
