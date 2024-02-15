const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
   quantity: { type: Number, default: 0 }, 
   totalPrice: { type: Number, default: 0 } 
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
