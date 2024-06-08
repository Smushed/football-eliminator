import { Schema, model } from 'mongoose';

const MatchUpsSchema = new Schema({
  season: {
    type: String,
    required: true,
    trim: true,
  },
  week: {
    type: Number,
    required: true,
  },
  matchups: [
    {
      home: String,
      away: String,
      _id: false,
    },
  ],
});

MatchUpsSchema.index(
  {
    season: 1,
    week: 1,
  },
  {
    unique: true,
  }
);

export default model('MatchUps', MatchUpsSchema);
