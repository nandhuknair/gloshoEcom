const mongoose = require('mongoose');
console.log(process.env.MONGOURL)
mongoose.connect("mongodb+srv://nandhuknair27:LQXPHqUIi0bejOif@cluster0.ntsuwkr.mongodb.net/glosho")
.then(()=> console.log('Connected to MongoDb'))
.catch((error)=> console.log("An error occur while connecting to MongoDb database"))