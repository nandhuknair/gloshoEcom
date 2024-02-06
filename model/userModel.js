const mongoose = require('mongoose');
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
    is_admin:{
        type:Number,
        default:0
    }
    
});

const User = mongoose.model('User',signupSchema)
module.exports = User ;
