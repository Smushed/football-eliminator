import { Schema, Types, model } from 'mongoose';

const GroupRosterSchema = new Schema({
  G: {
    //GroupId
    type: Types.ObjectId,
    ref: 'Group',
    unique: true,
    required: true,
  },
  P: {
    //Positions
    type: Array,
    default: [
      { N: 'QB', I: 0 },
      { N: 'RB', I: 1 },
      { N: 'RB', I: 1 },
      { N: 'WR', I: 2 },
      { N: 'WR', I: 2 },
      { N: 'RB/WR', I: 6 },
      { N: 'TE', I: 3 },
      { N: 'K', I: 4 },
    ],
  },
});

export default model('GroupRoster', GroupRosterSchema);
