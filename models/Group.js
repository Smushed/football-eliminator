const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

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
      ID: mongoose.Schema.Types.ObjectId, //UserID
      A: {
        //Admin
        type: Boolean,
        default: false,
      },
      B: {
        //Blocked
        type: Boolean,
        default: false,
      },
      _id: false,
    },
  ],
});

module.exports = mongoose.model(`Group`, GroupSchema);
