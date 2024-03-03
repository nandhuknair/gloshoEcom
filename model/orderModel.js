const mongoose = require('mongoose')
const orderSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    items:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            },
            quantity:{
                type:Number,
                require:true
            },
            price: {
              type:Number,
              require:true
            },
            orderStatus: {
              type:String,
              default:"Placed"
            },
        }
    ],
    totalAmount:{
        type:Number,
    },
   
    address: {
      type: Object,
    },
    paymentType: {
      type: String,
    },
    couponApplied:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Coupon"
    }

}
,{timestamps:true}

)

module.exports = mongoose.model("Order",orderSchema)
