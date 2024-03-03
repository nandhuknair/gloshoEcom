const mongoose = require('mongoose')
const offerSchema=new mongoose.Schema({
    name:{
        type:String
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'Category', 
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    percentage:{
        type:Number,
        default:0
    }

}
,{timestamps:true}

)

module.exports = mongoose.model("Offer",offerSchema)
