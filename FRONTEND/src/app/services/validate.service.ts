import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidateService {

  constructor() { }

  validateRegister(user){
    if(user.username==undefined||user.password==undefined||user.copypassword==undefined||user.role==undefined){
      return false;
    }else{
      return true;
    }
  }

  validateEmail(email){
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    return reg.test(email);
  }

  validatePassword(password,copypassword){
    if(password.length <8 || password!=copypassword)
    return false;
    else
    return true;
  }

  validateLogin(user){
    if(user.userid==undefined||user.password==undefined){
      return false;
    }
    else if(user.userid==""||user.password==""){
      return false;
    }
    else{
      return true;
    }
  }

  validateAddFields(user){
    if(user.userid==undefined||user.password==undefined||user.role==undefined)
      return false;
    else if(user.userid==""||user.password==""||user.role=="")
      return false;
    else if((user.role=="hod"||user.role=="student")&&(user.dept==undefined||user.dept==""))
      return false;
    else
    return true;
  }

  studentProfilevalidation(student){
    if(student.name==undefined||student.dob==undefined||student.year==undefined||student.aggregate==undefined||student.email==undefined||student.phone==undefined||student.address==undefined)
     return false;
    else if(student.name==""||student.dob==""||student.year==""||student.aggregate==""||student.email==""||student.phone==""||student.address=="")
      return false;
    else 
      return true;
  }

  validateFeed(obj){
    if(obj.firstname==""||obj.lastname==""||obj.country==""||obj.state==""||obj.zip==""||obj.email==""||obj.feedback==""||obj.address==""){
      return false;
    }
    else if(obj.firstname==undefined||obj.lastname==undefined||obj.country==undefined||obj.state==undefined||obj.zip==undefined||obj.email==undefined||obj.feedback==undefined||obj.address==undefined){
      return false;
    }
    else {
      return true;
    }
  }
}