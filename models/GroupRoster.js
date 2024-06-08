import { Schema, Types, model } from 'mongoose';

const GroupRosterSchema = new Schema({
  groupId: {
    type: Types.ObjectId,
    ref: 'Group',
    unique: true,
    required: true,
  },
  position: {
    type: Array,
    default: [
      { name: 'QB', id: 0 },
      { name: 'RB', id: 1 },
      { name: 'RB', id: 1 },
      { name: 'WR', id: 2 },
      { name: 'WR', id: 2 },
      { name: 'RB/WR', id: 6 },
      { name: 'TE', id: 3 },
      { name: 'K', id: 4 },
    ],
  },
});

export default model('GroupRoster', GroupRosterSchema);
