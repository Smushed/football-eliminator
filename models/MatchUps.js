import { Schema, model } from 'mongoose';

const MatchUpsSchema = new Schema({
  S: {
    //Season
    type: String,
    required: true,
    trim: true,
  },
  W: {
    //Week
    type: Number,
    required: true,
  },
  M: [
    {
      H: String, //Home
      A: String, //Away
      _id: false,
    },
  ],
});

export default model(`MatchUps`, MatchUpsSchema);
