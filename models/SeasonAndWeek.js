const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const SeasonAndWeekSchema = new Schema({
  S: {
    //Current Season
    type: String,
    required: true,
    default: "2021-2022-regular",
    trim: true,
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
