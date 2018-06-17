import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authToken: any;
  user: any;
  role: any;
  constructor(private http:Http,public jwtHelper: JwtHelperService) { }

  addUser(user){
    var headres = new Headers();
    headres.append('content-type','application/json');
    return this.http.post("http://localhost:3000/users/adduser",user,{headers:headres})
      .map(res =>  res.json());
  }

  deleteStudent(userid){
    return this.http.delete("http://localhost:3000/student/delete/"+userid)
      .map(res =>  res.json());
  }
  
  feedback(data){
    var headres = new Headers();
    headres.append('content-type','application/json');
    return this.http.post("http://localhost:3000/mail/feedback_send",data,{headers:headres})
    .map(res =>  res.json());
  }

  sendForgotMail(user){
    var headres = new Headers();
    headres.append('content-type','application/json');
    return this.http.post("http://localhost:3000/mail/forgot",user,{headers:headres})
    .map(res =>  res.json());
  }


  authUser(user){
    var headres = new Headers();
    headres.append('content-type','application/json');
    return this.http.post("http://localhost:3000/users/login",user,{headers:headres})
      .map(res =>  res.json());
  }

  getProfile(userid){
    var headres = new Headers();
    return this.http.get("http://localhost:3000/users/profile/"+userid)
      .map(res =>  res.json());
  }

  // getStudentProfile(userid){
  //   var headres = new Headers();
  //   headres.append('content-type','application/json');
  //   return this.http.get("http://localhost:3000/student/getstudent/"+userid,{headers:headres})
  //     .map(res =>  res.json());
  // }

  SearchStudents(basedon){
    var headres = new Headers();
    headres.append('content-type','application/json');
    return this.http.get("http://localhost:3000/student/getstudentbydeptyear/"+basedon.dept+"/"+basedon.year)
    .map(res =>  res.json());
  }

  updateProfile(userid,profileData){
    return this.http.put("http://localhost:3000/users/updateuser/"+userid,profileData)
    .map(res =>  res.json());
  }

  isProfileFilled(){
    var data=JSON.parse(localStorage.getItem('user'));
    if(data.name==undefined||data.name==""){
      return false;
    }
    else
      return true;
  }

  loadToken()
  {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  storeUserData(token,user){
    localStorage.setItem('id_token',token);
    localStorage.setItem('user',JSON.stringify(user));
    localStorage.setItem('role',user.role)
    this.authToken = token;
    this.user = user;
    this.role = user.role;
  }

  loggedIn(){
    if(this.jwtHelper.isTokenExpired()){
      return false;
    }else{
      return true;
    }
  }

  studentLoggedIn(){
    this.role=localStorage.getItem('role');
    if(this.loggedIn()&&this.role == "student")
    {
      return true;
    }
    else{
      return false;
    }
  }

  hodLoggedIn(){
    this.role=localStorage.getItem('role');
    if(this.loggedIn()&&this.role == "hod")
    {
      return true;
    }
    else{
      return false;
    }
  }

  tpoLoggedIn(){
    this.role=localStorage.getItem('role');
    if(this.loggedIn()&&this.role=="tpo")
    {
      return true;
    }
    else{
      return false;
    }
  }

  adminLoggedIn(){
    this.role=localStorage.getItem('role');
    if(this.loggedIn()&&this.role=="admin")
    {
      return true;
    }
    else{
      return false;
    }
  }


  logOut(){
    this.authToken=null;
    this.user = null;
    this.role = null;
    localStorage.clear();
  }
}