const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referralCode: {
        type: String,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;