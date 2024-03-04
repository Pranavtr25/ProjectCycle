const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userDatas",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  houseNo: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    requied: true,
  },
  pincode: {
    type: Number,
    requied: true,
  },
});

const AddressModel = mongoose.model("addresscollections", addressSchema);

module.exports = { AddressModel, addressSchema };