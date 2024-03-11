const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    productName: {
        type:String,
        required:true
    },
    image: {
        type:Array,
        required: true
    },
    price: {
        type:Number,
        required: true
    },
    size: {
        type:String,
        default:true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'Category', 
    },
    collection: {
        type:String,
        required:true
    },
    description: {
        type:String,
        required: true
    },
    stock: {
        type:Number,
        default:true
    },
    isAvailable:{
        type:Boolean,
        default:true
    },
    productOfferName:{
        type:String,
        default:null
    },
    categoryOfferName:{
        type:String,
        default:null
    },
    productOfferPrice:{
        type:Number,
        default:0
    },
    categoryOfferPrice:{
        type:Number,
        default:0
    }
    
},{timestamps:true});

const Product = mongoose.model('Product',productSchema)
module.exports = Product ;
