import { Schema, Types, model } from 'mongoose';

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    maxLength: 20,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
  },
  grouplist: [Types.ObjectId],
  admin: {
    type: Boolean,
    default: false,
  },
  mainGroup: Types.ObjectId,
});

export default model('User', UserSchema);
