var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var bcrypt = require('bcryptjs');
var async = require('async');
const User = require('../models/usermodel');
const Student = require('../models/studentmodel');
const HOD = require('../models/hodmodel');
const TPO = require('../models/tpomodel');
var xoauth2 = require('xoauth2');
var store=require("store");

router.get('/', function(req, res, next) {
    res.send('respond with a resource:mail');
  });

router.post('/feedback_send', (req, res) => {
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
    // let transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         xoauth2: xoauth2.createXOAuth2Generator({
    //             user: 'ch.mani9144@gmail.com',
    //             clientId: '1065186352070-05v0q1uaqo7qnrg5r4h766s7jjh1eotc.apps.googleusercontent.com',
    //             clientSecret: 'pg2rvLZRizl16_FnAWH4dLEh',
    //             refreshToken: '1/ZHtxyETfHzCvTWY0RD_yS-0TXnyGVa7e8h0_zUwLXa0'
    //         })
    //     }
    // });
    let  transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25,
        auth: {
          user: 'cms.feedback9144@gmail.com',
          pass: 'password.9144'
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

router.post('/forgot', function(req, res, next) {
    var usermail;
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
        User.findOne({ userid: req.body.userid }, function(err, user) {
            if (!user) {
            return res.json({success:false, msg:'No account with that userID exists.'});
            }
            else if(user.role=='student'){
                Student.findOne({ userid: req.body.userid }, function(err , userdata){
                    if(err) return next(err);
                    //console.log(user);
                    usermail = userdata.email;
                });
            }
            else if(user.role=='hod'){
                HOD.findOne({ userid: req.body.userid }, function(err , userdata){
                    if(err) return next(err);
                    //done(err, token, user);
                    usermail = userdata.email;
                });
            }
            else if(user.role=='tpo'){
                TPO.findOne({ userid: req.body.userid }, function(err , userdata){
                    if(err) return next(err);
                    //done(err, token, user);
                    usermail = userdata.email;
                });
            }
            else{
                return res.json({success:false, msg:'Something went wrong.'});
            }

            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            
            user.save(function(err) {
            done(err, token, user);
            });
        });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'gmail',
                secure: false,
                port: 25,
                auth: {
                    user: 'cms.feedback9144@gmail.com',
                    pass: 'password.9144'
                  },
                  tls:{
                      rejectUnauthorized:false
                  }
        });
        var mailOptions = {
            to: usermail,
            from: 'cms.feedback9144@gmail.com',
            subject: 'Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://'+ req.headers.host + '/mail/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
            if(!err)
            return res.json({success:true, msg:'An e-mail has been sent to ' + usermail + ' with further instructions.'});
            done(err, 'done');
        });
        }
    ], function(err) {
        if (err) return next(err);
        return res.json({success:false, msg:'Something went wrong'});
    });
    });

router.post('/reset/:token', function(req, res) {
    var usermail;
    async.waterfall([
        function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
            //req.flash('error', '');
            //return res.redirect('back');
            return res.json({success:false,msg:"Password reset token is invalid or has expired."})
            }
            else if(user.role=='student'){
                Student.findOne({ userid: user.userid }, function(err , userdata){
                    if(err) return next(err);
                    //console.log(user);
                    usermail = userdata.email;
                });
            }
            else if(user.role=='hod'){
                HOD.findOne({ userid: user.userid }, function(err , userdata){
                    if(err) return next(err);
                    //done(err, token, user);
                    usermail = userdata.email;
                });
            }
            else if(user.role=='tpo'){
                TPO.findOne({ userid: user.userid }, function(err , userdata){
                    if(err) return next(err);
                    //done(err, token, user);
                    usermail = userdata.email;
                });
            }
            else{
                return res.json({success:false, msg:'Something went wrong.'});
            }


            bcrypt.genSalt(10,function(err,salt){
                bcrypt.hash(req.body.password,salt,function(err,hash){
                  if(err) throw err;
                  user.password = hash;
                  user.resetPasswordToken = undefined;
                  user.resetPasswordExpires = undefined;
                  user.save(function(err) {
                        done(err, user);
                    });
                  });
                });
    
            //user.password = req.body.password;
        });
        },
        function(user, done) {
        //console.log(user);
        var smtpTransport = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            port: 25,
            auth: {
            user: 'cms.feedback9144@gmail.com',
            pass: 'password.9144'
            },
            tls:{
                rejectUnauthorized:false
            }
        });
        var mailOptions = {
            to: usermail,
            from: 'passwordreset@demo.com',
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.userid + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
            res.json({success: true, msg: 'Success! Your password has been changed.'});
            done(err,'done');
        });
        }
    ], function(err) {
        res.json({success: false, msg: 'somthing went wrong.'});
    });
    });

router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
        //req.flash('error', 'Password reset token is invalid or has expired.');
        //res.json({msg:"not user"});
        return res.redirect('http://localhost:4200/forgot');
        }
        store.set("token",req.params.token);
        //console.log(store.get("token"));
        res.redirect('http://localhost:4200/resetpwd?token='+req.params.token);
    });
    });

    router.get('/getpwdresettoken', function(req, res) {
       
    });

module.exports = router;