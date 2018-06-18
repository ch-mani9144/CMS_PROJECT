var express = require('express');
var router = express.Router();
var mergejson = require('merge-json');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../config/db');
const User = require('../models/usermodel');
const Student = require('../models/studentmodel');
const HOD = require('../models/hodmodel');
const TPO = require('../models/tpomodel');
const multer = require('multer');
var crypto=require('crypto');
var mime=require('mime');
var path=require('path');
var DIR = './public/uploads/';

const storage = multer.diskStorage({
  destination: function(req, image, cb) {
    cb(null,  DIR);
  },
  filename: function(req, image, cb) {
    // cb(null, new Date().toISOString() + image.originalname);
    // crypto.pseudoRandomBytes(16, function (err, raw) {
    //   cb(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(image.mimetype));
    // });
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)

      cb(null, raw.toString('hex') + path.extname(image.originalname));
      
    })
  }
});

const fileFilter = (req, image, cb) => {
  // reject a file
  if (image.mimetype === 'image/jpeg' || image.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

var upload = multer({
  // destination:'../uploads/',
  
storage: storage,
// limits: {
//   fileSize: 1024 * 1024 * 5
// },
fileFilter: fileFilter
});


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource:users');
});

router.post('/login', function(req, res, next) {
  var userid = req.body.userid;
  var password = req.body.password;
  var token;
  User.getUserByUserId(userid,function(err,user){
    if(err) throw err;
    console.log(userid);
    if(!user){
      return res.json({success:false,msg:"user not found."});
    }
    User.compareUserPassword(password,user.password,function(err,ismatch){
      if(err) throw err;
      if(ismatch){
        //code to get profile
        if(user.role=='student'){
          Student.getStudentByUserId(userid,function(err,userdata){
            if(err) throw err;
            if(!userdata){
              return res.json({success: false,msg:"student not found."});
            }else{
              token = jwt.sign(userdata.toObject(), config.secret, {expiresIn: 3600 });
              return res.json({success:true,msg:"Student login success.",token: "Bearer "+token,user:userdata});
            }
          });
        }
        else if(user.role=='hod'){
          HOD.getHodByUserId(userid,function(err,userdata){
            if(err) throw err;
            if(!userdata){
              return res.json({success: false,msg:"HOD not found."});
            }else{
              token = jwt.sign(userdata.toObject(), config.secret, {expiresIn: 3600 });
              return res.json({success:true,msg:"HOD login success.",token: "Bearer "+token,user:userdata});
            }
          });
        }
        else if(user.role=='tpo'){
          TPO.getTpoByUserId(userid,function(err,userdata){
            if(err) throw err;
            if(!userdata){
              return res.json({success: false,msg:"TPO not found."});
            }else{
              token = jwt.sign(userdata.toObject(), config.secret, {expiresIn: 3600 });
              return res.json({success:true,msg:"TPO login success.",token: "Bearer "+token,user:userdata});
            }
          });
        }
        else if(user.role=='admin'){
          token = jwt.sign(user.toObject(), config.secret, {expiresIn: 3600 });
          return res.json({success:true,msg:"Admin login success.",token: "Bearer "+token,user:user});
        }
        else{
          return res.json({success: false,msg:"unknown role found"});
        }
        
      }else{
        return res.json({success:false,msg:"wrong password."});
      }
    });
  });
});

router.post('/adduser',function(req,res,next){
  var newuser = new User();
  newuser.userid =req.body.userid;
  newuser.password =req.body.password;
  newuser.role =req.body.role;
  // User.addUser(newuser, function(err,user){
  //       if(err){
  //         res.json({success:false , msg:"UserID Already Exist in users."});
  //       }else{
  //         res.json({success:true , msg:"added in users."});
  //       }
  //     });
  //   });
  var roleUser;
  if(newuser.role=="student"){
    roleUser = new Student();
    roleUser.userid =req.body.userid;
    //roleUser.password =req.body.password;
    roleUser.role = req.body.role;
    roleUser.dept = req.body.dept;
    User.addUser(newuser, function(err,user){
      if(err){
        res.json({success:false , msg:"UserID Already Exist in users."});
      }else{
        Student.addStudent(roleUser,function(err,user){
          if(err){
            res.json({success:false , msg:"add student failed."});
          }else{
            res.json({success:true , msg:"success in add student"});
          }
        });
      }
    });
  }
  else if(newuser.role=='hod'){
    roleUser = new HOD();
    roleUser.userid =req.body.userid;
    //roleUser.password =req.body.password;
    roleUser.role = req.body.role;
    roleUser.dept = req.body.dept;
    User.addUser(newuser, function(err,user){
      if(err){
        console.log(err);
        res.json({success:false , msg:"UserID Already Exist in users."});
      }
      else{
        HOD.addHod(roleUser,function(err,hoduser){
          if(err){
            User.removeUserByUserId(req.body.userid,function(err,result){
              if(err){
                console.log(err);
              }
              else{
                console.log(result);
              }
            })
            res.json({success:false , msg:"HOD For this Dept Already exist."});
          }
          else{
            res.json({success:true , msg:"success in add HOD."});
          }
        });
      }
    });
  }
  else if(newuser.role=='tpo'){
    roleUser = new TPO();
    roleUser.userid =req.body.userid;
    //roleUser.password =req.body.password;
    roleUser.role = req.body.role;
    User.addUser(newuser, function(err,user){
      if(err){
        res.json({success:false , msg:"UserID Already Exist in users."});
      }else{
        TPO.addTpo(roleUser,function(err,user){
          if(err){
            res.json({success:false , msg:"add TPO failed."});
          }else{
            res.json({success:true , msg:"success in add TPO."});
          }
        });
      }
    });
  }
  else if(newuser.role=="admin"){
    User.addUser(newuser, function(err,user){
      if(err){
        res.json({success:false , msg:"UserID Already Exist."});
      }else{
        res.json({success:true , msg:"success in add admin."});
      }
    });
  }
  else
    res.json({success:false , msg:"role can't be accepted"});
  });


  //geting user profile
router.get('/profile/:userid', function(req, res, next) {
  User.getUserByUserId(req.params.userid,function(err,user){
    console.log(user);
    if(err)
    {
      res.json({"error":err});
    }
    else if(!user){
     res.json({success:false,msg:"User Not Found"});
    }
    else 
    {
      // console.log(req.file.path);
      //console.log(user);
      if(user.role=="student")
      {
        //console.log(req.file.filename);
        Student.getStudentByUserId(req.params.userid,function(err,result){
            if(err){
              res.json(err);}
            else{
              res.json({success:true,user:result});
            }
          });
      }
      //Update HOD
      else if(user.role=="hod")
      {
        HOD.getHodByUserId(req.params.userid,function(err,result){
          if(err){
            res.json(err);}
          else{
            res.json({success:true,user:result});
          }
          });
      }
      //Update TPO
      else if(user.role=="tpo")
      {
        TPO.getTpoByUserId(req.params.userid,function(err,result){
            if(err){
              res.json(err);}
            else{
              res.json({success:true,user:result});
            }
          });
      }
      else{
        console.log("Invalid Update");
        res.json({success:false,msg:"Invalid Userid:"});
      }
    }
    
  })
});

//GET All Users

router.get('/getallusers', function(req, res, next) {
  User.getAllUsers(function(err,userdata){
    res.json(userdata);
  });
});

//GET Student By Department
router.get('/getstudentbydept/:dept', function(req, res, next) {
  Student.getStudentByDept(req.params.dept,function(err,userdata){
    res.json(userdata);
  });
});

//GET Student By Dept and Id
router.get('/getstudentbydeptuserid/:dept/:id', function(req, res, next) {
  Student.getStudentByDeptUserId(req.params.dept,req.params.id,function(err,userdata){
    res.json(userdata);
  });
});

//GET Students

router.get('/getallstudents', function(req, res, next) {
  Student.getAllStudents(function(err,data){
    res.json(data);
  });
});

//GET all HODs
router.get('/getallhods', function(req, res, next) {
  //res.send('respond with a resource:users');
  HOD.getAllHods(function(err,userdata){
    res.json(userdata);
  });
});

//GET all TPOs
router.get('/getalltpos', function(req, res, next) {
  //res.send('respond with a resource:users');
  TPO.getAllTpos(function(err,userdata){
    res.json(userdata);
  });
});

//Update Students Add Remaining fields storing also
router.put('/updateuser/:userid',multer({dest:"./public/uploads/"}).single('image'), function(req, res, next) {
  User.getUserByUserId(req.params.userid,function(err,user){
    //console.log(user);
    if(err)
    {
      res.json({"error":err});
    }
    else if(!user){
     res.json({success:false,msg:"User Not Found"});
    }
    else 
    {
      //console.log(req.file.path);
      //console.log(user);
      if(user.role=="student")
      {
        //console.log(req.file.filename);
        var stu={
            name:req.body.name,
            dob:req.body.dob,
            phone:req.body.phone, 
            email:req.body.email,
            aggregate:req.body.aggregate,
            address:req.body.address,
            year:req.body.year
        };
        if(req.body.pic=="true"){
          delete stu['pic'];
          stu=Object.assign(stu,{image:req.file.filename});
        }else{
          delete stu['pic'];
        }
        Student.update({userid:req.params.userid},stu,function(err,result){
            if(err){
              console.log(err);
              res.json(err);}
            else if(result.n==1){
              res.json({success:true,msg:"Updated"});
              console.log(result); 
            }
            else{
              console.log(result);
              res.json({success:false,msg:JSON.stringify(result)});
            }
          });
      }
      //Update HOD
      else if(user.role=="hod")
      {
        var hod={
          name:req.body.name,
          qualification:req.body.qualification,
          phone:req.body.phone, 
          email:req.body.email,
          address:req.body.address
      };
      if(req.body.pic=="true"){
        delete hod['pic'];
        hod=Object.assign(hod,{image:req.file.filename});
      }else{
        delete hod['pic'];
      }
        HOD.update({userid:req.params.userid},hod,function(err,result){
            if(err){
              res.json(err);}
            else if(result.n==1){
              res.json({success:true,msg:"Updated"}); 
            }else{
              res.json({success:false,msg:JSON.stringify(result)});
            }
          });
      }
      //Update TPO
      else if(user.role=="tpo")
      {
        var tpo={
          name:req.body.name,
          qualification:req.body.qualification,
          phone:req.body.phone, 
          email:req.body.email,
          address:req.body.address
        }
        if(req.body.pic=="true"){
          delete tpo['pic'];
          tpo=Object.assign(tpo,{image:req.file.filename});
        }else{
          delete tpo['pic'];
        }
        TPO.update({userid:req.params.userid},tpo,function(err,result){
            if(err){
              res.json(err);}
            else if(result.n==1){
              res.json({success:true,msg:"Updated"}); 
            }else{
              res.json({success:false,msg:json.stringify(result)});
            }
          });
      }
      else{
        console.log("Invalid Update");
        res.json({success:false,msg:"Invalid Update"});
      }
    }
    
  })
});


router.post('/changepassword', function(req, res, next) {
  var userid = req.body.userid;
  var oldpassword = req.body.oldpassword;
  var newpassword = req.body.newpassword;
  var confirmpassword = req.body.confirmpassword;
  if(newpassword==confirmpassword){
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newpassword, salt, (err, hash) => {
        if(err) throw err;
        newpassword = hash;
      });
    });
    User.getUserByUserId(userid,function(err,user){
      if(err) throw err;
      if(!user){
        return res.json({success:false,msg:"user not found."});
      }
      User.compareUserPassword(oldpassword,user.password,function(err,ismatch){
        if(err) throw err;
        if(ismatch){
          User.findOneAndUpdate({userid:userid},{$set:{password:newpassword}},function(err,result){
            if(err){
              res.json(err);
            }
            else{
              res.json({success:true,msg:"Password Updated Succesfully."});
            }
          });
        }
        else{
          return res.json({success:false,msg:"password update failed,Invalid Old Password."});
        }
      });
    });
  }
  else{
    res.json({success:false,msg:"Confirm Password and New Password Need to be Matched"});
  }
});


module.exports = router;
