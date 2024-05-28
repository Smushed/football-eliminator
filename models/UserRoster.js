import { Schema, Types, model } from 'mongoose';

const UserRosterSchema = new Schema(
  {
    U: {
      //UserId
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      unique: false,
    },
    G: {
      //GroupId
      type: Types.ObjectId,
      required: true,
      ref: 'Group',
      unique: false,
    },
    W: {
      //Week
      type: Number,
      required: true,
      unique: false,
    },
    S: {
      //Season
      type: String,
      required: true,
      trim: true,
      unique: false,
    },
    R: [
      //Roster
      {
        M: {
          //MySportsId
          type: Number,
          required: true,
          default: 0,
        },
        SC: {
          //Score
          type: Number,
          required: true,
          default: 0,
        },
        _id: false,
      },
    ],
  },
  {
    strict: false,
  }
);

UserRosterSchema.index(
  {
    U: 1,
    G: -1,
    W: -1,
    S: -1,
  },
  {
    unique: true,
  }
);

export default model('UserRoster', UserRosterSchema);
