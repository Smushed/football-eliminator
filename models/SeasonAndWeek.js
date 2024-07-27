import { Schema, model } from 'mongoose';

const SeasonAndWeekSchema = new Schema({
  season: {
    type: String,
    required: true,
    default: '2024-2025-regular',
    trim: true,
    unique: true,
  },
  week: {
    type: Number,
    required: true,
    default: 1,
  },
  lockWeek: {
    type: Number,
    required: true,
    default: 0,
  },
  seasonOver: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export default model('SeasonAndWeek', SeasonAndWeekSchema);
