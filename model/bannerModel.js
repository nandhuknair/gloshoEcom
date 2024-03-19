const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
   bannerName:{ type:String },
   heading: { type:String},
   subheading: { type: String },
   image: String, 
   brandName: { type: String },
   brandId:{ type:String } 
});

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
