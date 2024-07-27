import { Schema, Types, model } from 'mongoose';

const GroupSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  description: { type: String, trim: true },
  hidePlayersUntilLocked: { type: Boolean, default: false },
  userlist: [
    {
      userId: Types.ObjectId,
      admin: { type: Boolean, default: false },
      blocked: { type: Boolean, default: false },
      _id: false,
    },
  ],
});

export default model('Group', GroupSchema);
