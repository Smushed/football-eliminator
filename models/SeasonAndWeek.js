import { Schema, model } from 'mongoose';

const SeasonAndWeekSchema = new Schema({
  season: {
    //Current Season
    type: String,
    required: true,
    default: '2024-2025-regular',
    trim: true,
    unique: true,
  },
  week: {
    //Current Week
    type: Number,
    required: true,
    default: 1,
  },
  lockWeek: {
    //Current Lock Week
    type: Number,
    required: true,
    default: 0,
  },
});

export default model('SeasonAndWeek', SeasonAndWeekSchema);
