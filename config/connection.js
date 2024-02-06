const mongoose = require('mongoose');
require('dotenv').config()
console.log(process.env.MONGOURL)
mongoose.connect(process.env.MONGOURL)
.then(()=> console.log('Connected to MongoDb'))
.catch((error)=> console.log("An error occur while connecting to MongoDb database"))