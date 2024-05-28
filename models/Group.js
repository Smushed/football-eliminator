import { Schema, Types, model } from 'mongoose';

const GroupSchema = new Schema({
  N: {
    //Name
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  D: String, //Description
  UL: [
    //Userlist
    {
      ID: Types.ObjectId, //UserID
      A: { type: Boolean, default: false }, //Admin
      B: { type: Boolean, default: false }, //Blocked
      _id: false,
    },
  ],
});

export default model('Group', GroupSchema);
