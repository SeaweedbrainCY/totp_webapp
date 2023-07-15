import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { UserService } from '../common/User/user.service';
import { HttpClient } from '@angular/common/http';
import { faChevronCircleLeft, faGlobe, faKey } from '@fortawesome/free-solid-svg-icons';
import { Utils  } from '../common/Utils/utils';

@Component({
  selector: 'app-edit-totp',
  templateUrl: './edit-totp.component.html',
  styleUrls: ['./edit-totp.component.css']
})
export class EditTOTPComponent implements OnInit{
  faChevronCircleLeft = faChevronCircleLeft;
  faGlobe = faGlobe;
  faKey = faKey;
  name = "";
  uuid="";
  secret = "";
  nameError = "";
  secretError = "";
  color="info";
  selected_color="Blue";
  totp = require('totp-generator');
  code = "";
  time=80;
  duration = 0;
  currentUrl:string = "";
  getElementID:string|null = null;
  constructor(
    private router: Router,
    private route : ActivatedRoute,
    private userService : UserService,
    private http: HttpClient,
    private utils: Utils
  ){
    router.events.subscribe((url:any) => {
      if (url instanceof NavigationEnd){
          this.currentUrl = url.url;
      }
    });
  }

  ngOnInit(){
    if(this.userService.getId() == null){
      //this.router.navigate(["/login/sessionKilled"], {relativeTo:this.route.root});
    }
    this.getElementID = this.route.snapshot.paramMap.get('id');
    console.log(this.getElementID)
    if(this.getElementID == null){
        if(this.currentUrl != "/vault/add"){
          this.router.navigate(["/vault"], {relativeTo:this.route.root});
          return;
        }
    } else {
      const vault = this.userService.getVault();
      if(vault == null || !vault.has(this.getElementID)){
        this.router.navigate(["/vault"], {relativeTo:this.route.root});
        return;
      } else {
        const property = vault.get(this.getElementID)!;
        this.uuid = this.getElementID;
        this.name = property.get("name")!;
        this.secret = property.get("secret")!;
        this.color = property.get("color")!;
        switch(this.color){
          case "info":{
            this.selected_color = "Blue";
            break;
          }
          case "primary":{
            this.selected_color = "Green";
            break;
          }
          case "warning":{
            this.selected_color = "Orange";
            break;
          }
          case "danger":{
            this.selected_color = "Red";
            break;
          }
          default:{
            this.selected_color = "Blue";
            break;
          }
        }
      }

    }

    setInterval(()=> { this.generateCode() }, 100);
    setInterval(()=> { this.generateTime() }, 20);
  }

  checkName(){
    this.nameError = "";
    if(this.name == ""){
      this.nameError = "Domain cannot be empty";
      return;
    }
    if(this.name.length > 30){
      this.nameError = "Domain cannot be longer than 30 characters";
      return;
    }
    if(this.utils.sanitize(this.name) != this.name){
      this.nameError = "&, <, >, \" and ' are forbidden";
      return;
    }
  }

  generateTime(){
    const duration = 30 - Math.floor(Date.now() / 10 % 3000)/100;
    this.time = (duration/30)*100
  }

  generateCode(){
   this.code=this.totp(this.secret);
   if(this.code.length == 6){
    this.code = this.code[0]+this.code[1]+this.code[2] + " " + this.code[3]+this.code[4]+this.code[5] 
  }
  
   }
   

  checkSecret(){
    if(this.secret == ""){
      this.secretError = "Secret cannot be empty";
      return;
    }

    if(this.secret != this.utils.sanitize(this.secret)){
      this.secretError = "&, <, >, \" and ' are forbidden";
      return;
    }
    this.generateCode();
  }

  changeColor(colorSelected:string){
    console.log(colorSelected)
    switch(colorSelected){
      case "Blue":{
        this.color = "info";
        break;
      }
      case "Green":{
        this.color = "primary";
        break;
      }
      case "Orange":{
        this.color = "warning";
        break;
      }
      case "Red":{
        this.color = "danger";
        break;
      }
      default:{
        this.color = "info";
        break;
      }
    }
  }

  cancel(){
    this.router.navigate(["/vault"], {relativeTo:this.route.root});
  }

  save(){
    if(this.userService.getId() == null){
      //this.router.navigate(["/login/sessionKilled"], {relativeTo:this.route.root});
    }
   let vault = this.userService.getVault();
    if(this.getElementID != null){
      vault!.delete(this.getElementID);
    } else {
      this.uuid = crypto.randomUUID();
    }
    const property = new Map<string,string>();
    property.set("secret", this.secret);
    property.set("color", this.color);
    property.set("name", this.name);
    if(vault == null){
      vault = new Map<string, Map<string,string>>();
    }
    vault.set(this.uuid, property);
    this.userService.setVault(vault);
    this.router.navigate(["/vault"], {relativeTo:this.route.root});
  }
  

}
