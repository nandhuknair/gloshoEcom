const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    email: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pincode: {
      type: Number,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    landmark: {
      type: String,
    },
  },
  { timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);
module.exports = Address;