import { Schema, Types, model } from 'mongoose';

const UserSchema = new Schema({
  UN: {
    //Username
    type: String,
    unique: true,
    trim: true,
    maxLength: 20,
  },
  E: {
    //Email
    type: String,
    unique: true,
    trim: true,
  },
  GL: [Types.ObjectId], //GroupList
  A: {
    //Admin
    type: Boolean,
    default: false,
  },
  MG: Types.ObjectId, //Main Group
});

export default model('User', UserSchema);
