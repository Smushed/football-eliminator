import { Schema, Types, model } from 'mongoose';

const UserScoresSchema = new Schema({
  U: {
    //User ID
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  G: {
    //GroupID
    type: Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  S: {
    //Season
    type: String,
    required: true,
  },
  TS: {
    //Total Score
    type: Number,
    default: 0,
  },
  1: {
    type: Number,
    default: 0,
  },
  2: {
    type: Number,
    default: 0,
  },
  3: {
    type: Number,
    default: 0,
  },
  4: {
    type: Number,
    default: 0,
  },
  5: {
    type: Number,
    default: 0,
  },
  6: {
    type: Number,
    default: 0,
  },
  7: {
    type: Number,
    default: 0,
  },
  8: {
    type: Number,
    default: 0,
  },
  9: {
    type: Number,
    default: 0,
  },
  10: {
    type: Number,
    default: 0,
  },
  11: {
    type: Number,
    default: 0,
  },
  12: {
    type: Number,
    default: 0,
  },
  13: {
    type: Number,
    default: 0,
  },
  14: {
    type: Number,
    default: 0,
  },
  15: {
    type: Number,
    default: 0,
  },
  16: {
    type: Number,
    default: 0,
  },
  17: {
    type: Number,
    default: 0,
  },
  18: {
    type: Number,
    default: 0,
  },
});

UserScoresSchema.index(
  {
    U: 1,
    G: -1,
    S: -1,
  },
  {
    unique: true,
  }
);

export default model('UserScores', UserScoresSchema);
