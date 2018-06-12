import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  posts: any[];
  user:any;
  title:String;
  content:String;
  year:String;
  dept:String;
  pselect:String;
  constructor(
    private postService:PostService,
    private authService:AuthService,
    private flashmessage:FlashMessagesService,
    private router:Router
  ) {
  }

  ngOnInit() {
    this.user=JSON.parse(localStorage.getItem('user'));
    if(this.user.role=='student'){
    this.postService.getStudentPosts(this.user.dept,this.user.year).subscribe(posts=>{
      this.posts=posts;
      this.posts.reverse();
      console.log(this.posts);
    });}
    else if(this.user.role=="hod"){
      this.postService.getHodPosts(this.user.dept).subscribe(posts=>{
        this.posts=posts;
        this.posts.reverse();});
      }
      else if(this.user.role=='tpo'){
        this.postService.getTpoPosts().subscribe(posts=>{
          this.posts=posts;
          this.posts.reverse();});
      }
      else{

      }
    }

  onPostClick(){
    var postObj={
      postedby:this.user.userid,
    	title:this.title,
	    content:this.content,
	    year:this.year,
	    dept:this.user.dept,
      prole:this.user.role
    }
    if(this.authService.tpoLoggedIn()){
      postObj.dept=this.dept;
    }
    this.postService.postNotification(postObj).subscribe(result => {
      if(result.msg == "posted successfully"){
        this.flashmessage.show(result.msg,{cssClass:'alert-success text-center',timeOut:2000});
        this.posts.unshift(postObj);
        this.title="";
        this.content="";
        this.year="";
        this.dept="";
      }
      else{
        this.flashmessage.show("Something went wrong.",{cssClass:'alert-success text-center',timeOut:2000});
      }
    } );
  }

  getPostsOf()
  {

    alert("changed");
    this.ngOnInit();

  }


  
}
