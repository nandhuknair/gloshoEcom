
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const connection = require('./config/connection');
require('dotenv').config()
  
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');   

const app = express();


app.use((req, res, next) => {
  res.header("cache-control", "no-cache private,no-store,must-revalidate");// ,max-stale=0,post-check=0,pre--check=0 
  next();
})


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })   
); 


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', usersRouter);
app.use('/',adminRouter);

app.all('*', (req, res) => { 
  res.render('error') 
}); 

const PORT = 9000;
 
app.listen(PORT, function(err){
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", PORT);
})
