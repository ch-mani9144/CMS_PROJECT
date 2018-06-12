var express = require('express');
var router = express.Router();
const User = require('../models/usermodel');
const Student = require('../models/studentmodel');
const HOD = require('../models/hodmodel');
const TPO = require('../models/tpomodel');

router.get('/getstudent/:userid', function(req, res, next) {
    Student.getStudentByUserId(req.params.userid,function(err,student){
      res.json(student);
    });
  });

//GET Students By Dept and Year

router.get('/getstudentbydeptyear/:dept/:year', function(req, res, next) {
  Student.getStudentByDeptYear(req.params.dept,req.params.year,function(err,userdata){
    res.json(userdata);
  });
});

router.get('/tposearch',function(req,res,next){
    let quary;
    var depts=JSON.parse(req.query.depts);
    var years=JSON.parse(req.query.years);
    if(depts.length!=0&&years.length!=0)
      quary={dept:{$in:depts},year:{$in:years}}
    else if(depts.length==0)
      quary={year:{$in:years}}
    else if(years.length==0)
      quary={dept:{$in:depts}}
    else
      return res.json([]);
    Student.find(quary,function(err,result){
      if(err) throw err;
      res.json(result);
    })
})

//Delete Users
router.delete('/delete/:userid', function(req, res, next) {
  User.getUserByUserId(req.params.userid,function(err,user){
    if(err)
    {
      res.json({"error":err});
    }
    else if(!user){
     res.json({success:false,msg:"User Not Found"});
    }
    else 
    {
      User.remove({userid:req.params.userid},function(err,result){
        if(err){
          res.json(err);}
        else if(result.n==1){
          //res.json({success:true,msg:"Deleted in All Users"}); 
          if(user.role=="student")
          {
            Student.remove({userid:req.params.userid},function(err,result1){
            if(err)
            {
              res.json(err);
            }
            else if(result1.n==1)
            { 
              res.json({success:true,msg:"Deleted in Allusers And Students"}); 
            }
            else{
              res.json({success:false,msg:json.stringify(result1)});
            }
        });
          }
          //Update HOD
          else if(user.role=="hod")
          {
            HOD.remove({userid:req.params.userid},function(err,result2){
                if(err){
                  res.json(err);}
                else if(result2.n==1){
                  res.json({success:true,msg:"Deleted in Allusers And HOD"}); 
                }else{
                  res.json({success:false,msg:json.stringify(result2)});
                }
              });
          }
          //Update TPO
          else if(user.role=="tpo")
          {
            TPO.remove({userid:req.params.userid},function(err,result3){
                if(err){
                  res.json(err);}
                else if(result3.n==1){
                  res.json({success:true,msg:"Deleted in Allusers And TPO"}); 
                }else{
                  res.json({success:false,msg:json.stringify(result3)});
                }
              });
          }
          else if(user.role=="admin")
          {
            res.json({success:true,msg:"Deleted in Allusers"}); 
          }
          else{
            console.log("Invalid Deletion");
            res.json({success:false,msg:"Invalid Role Based Deletion"});
          }
        }
        else{
          res.json({success:false,msg:"Invalid Deletion in AllUsers"});
        }
        
      })
    }
  })
});



module.exports = router;