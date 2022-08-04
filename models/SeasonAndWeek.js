const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const SeasonAndWeekSchema = new Schema({
  S: {
    //Current Season
    type: String,
    required: true,
    default: '2022-2023-regular',
    trim: true,
    unique: true,
  },
  W: {
    //Current Week
    type: Number,
    required: true,
    default: 1,
  },
  LW: {
    //Current Lock Week
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model(`SeasonAndWeek`, SeasonAndWeekSchema);
