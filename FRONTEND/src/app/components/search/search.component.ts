import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Student } from '../../models/student';
import { FlashMessagesService } from 'angular2-flash-messages';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  dept:string;
  year:string;
  students: Student[];
  student: Student;
  tpodepts:any[];
  tpoyears:any[];
  tpoResult:any[];
  tpotable:Boolean=false;

  constructor(private authService:AuthService,
  private flashmessage:FlashMessagesService,
  private searchService:SearchService
) { }

  ngOnInit() {
    this.students=[];
    this.tpodepts=[];
    this.tpoyears=[];
    this.tpoResult=[];
  }

  onSearchSubmit(){
    var basedon={
      dept:this.dept,
      year:this.year
    }
    this.authService.SearchStudents(basedon)
      .subscribe(results => this.students=results);
    }

  hasResult(){
    if(this.students.length!=0||this.tpoResult.length!=0)
    return true;
    else
    return false;
  }

  selectdepts(ev){
    if(ev.currentTarget.checked){
      this.tpodepts.push(ev.target.defaultValue);
      console.log(this.tpodepts);}
    else{
      var out=this.tpodepts.splice(this.tpodepts.indexOf(ev.target.defaultValue));
      console.log(this.tpodepts);
    }
 }
 selectyears(ev){
  if(ev.currentTarget.checked){
    this.tpoyears.push(ev.target.defaultValue);
    console.log(this.tpoyears);}
  else{
    var out=this.tpoyears.splice(this.tpoyears.indexOf(ev.target.defaultValue));
    console.log(this.tpoyears);
  }
}

onSearchClick(){
  if(this.tpodepts.length==0&&this.tpoyears.length==0){
    this.tpoResult=[];
    this.tpotable=false;
    return;
  }
  this.searchService.tpoSearch(JSON.stringify(this.tpodepts),JSON.stringify(this.tpoyears))
  .subscribe(data => {
    if(data.length==0){
      this.flashmessage.show("No recoreds found",{cssClass:'alert-danger text-center',timeOut:2000});
      this.tpotable=false;
      this.tpoResult=[];}
    else{
        this.tpoResult=data;
        this.tpotable=true;
        console.log(this.tpoResult);
    }
  })
}

deletestudent(student){
  console.log(student);
  this.authService.deleteStudent(student.userid).subscribe(data=>{
    if(data.success){
      this.flashmessage.show("student record deleted",{cssClass:'alert-success text-center',timeOut:2000});
      this.students.splice(this.students.indexOf(student))
    }
    else
    {
      console.log(data);
      this.flashmessage.show("Something went wrong.",{cssClass:'alert-danger text-center',timeOut:2000});
    }
  })
}

}
