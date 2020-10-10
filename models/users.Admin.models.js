const mongoose = require("mongoose");
const userschema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  contact: {
    type: Number
  },
  name: {
    type: String
  },
  surname: {
    type: String
  },
  profileImage: {
    type: String,
  },
  address: {
    type: String,
  },
  isAdmin: {
    type: Boolean
  }

})
const User = new mongoose.model("user", userschema);

module.exports = User