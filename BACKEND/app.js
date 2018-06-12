var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');
var passport = require('passport');
var bodyparser = require('body-parser');
var nodemailer = require('nodemailer');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var studentRouter = require('./routes/student');
var postRouter = require('./routes/post');

var dbconfig = require('./db/dbconnection');

//express middleware
var app = express();

//database connection
var db = mongoose.connection;
mongoose.connect(dbconfig.url);

db.on("error",function(){
  console.log("DB connection:ERROR");
});

db.on("connected",function(){
  console.log("DB connection:connected");
});


//passport
app.use(passport.initialize());
app.use(passport.session());
require("./db/passport")(passport);

//cors 
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyparser.json()); 
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/student', studentRouter);
app.use('/post', postRouter);

app.post('/feedback_send', (req, res) => {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>First Name: ${req.body.firstname}</li>
      <li>Last Name: ${req.body.lastname}</li>
      <li>Email: ${req.body.email}</li>
      <li>Address: ${req.body.address}</li>
      <li>Country: ${req.body.country}</li>
      <li>State: ${req.body.state}</li>
      <li>Zip: ${req.body.zip}</li>
      
    </ul>
    <h3>User Feedback</h3>
    <p>${req.body.feedback}</p>
  `;
  
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
        auth: {
        user: 'cms.feedback9144@gmail.com', // generated ethereal user
        pass: 'password@9144'  // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
      from: '"college manager" <cms.feedback9144@gmail.com>', // sender address
      to: 'n130318@rguktn.ac.in,ch.mani9144@gmail.com', // list of receivers
      subject: 'Node Contact Request', // Subject line
      text: 'Hello world?', // plain text body
      html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log("The message was sent!");
      console.log(info);
      res.json({msg:"Feedback Sent Successfully",success:"true"});
      });
  });


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
