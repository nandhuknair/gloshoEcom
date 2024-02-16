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
            price:{
                type:Number,
                require:true
            },
            deliveryTime:{
                type:Number,
                required:true
            },
            status_date: {
              type: Date,
              default:Date.now()
            },
            orderStatus: {
              type:String,
              default:"placed"
            },
            reason: {
              type: String
            }
        }
    ],
    start_date:{
        type:Date,
        default:Date.now()
    },
    totalAmount:{
        type:Number,
    },
   
    address: {
      type: Array,
    },
    paymentType: {
      type: String,
    }

})

module.exports = mongoose.model("Order",orderSchema)
