let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let session = require('express-session');
let connection = require('./config/connection');
require('dotenv').config()
  


let usersRouter = require('./routes/users');
let adminRouter = require('./routes/admin');   

   
let app = express();

app.use((req, res, next) => {
  res.header("cache-control", "no-cache private,no-store,must-revalidate");// ,max-stale=0,post-check=0,pre--check=0 
  next();
})
app.use(
  session({
    secret: "mysecreqwe",
    resave: false,
    saveUninitialized: false,
  })   
); 
      
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// session management


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', usersRouter);
app.use('/',adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
