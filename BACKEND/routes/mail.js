var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const User = require('../models/usermodel');
const Student = require('../models/studentmodel');
const HOD = require('../models/hodmodel');
const TPO = require('../models/tpomodel');
const POSTS = require('../models/postmodel');

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
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      port: 465,
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

module.exports = router;