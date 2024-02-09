const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    landmark: {
        type: String,
        required: true
    }
});


const signupSchema = new mongoose.Schema({
    userName: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required: true
    },
    number: {
        type:Number,
        required: true
    },
    password: {
        type:String,
        required:true
    },
    confirmPassword: {
        type:String,
        required: true
    },
    active: {
        type:Boolean,
        default:true
    },
    address: [addressSchema],
    is_admin:{
        type:Number,
        default:0
    }
    
});

const User = mongoose.model('User',signupSchema)
module.exports = User ;
