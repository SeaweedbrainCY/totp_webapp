import { Component, OnInit } from '@angular/core';
import { UserService } from '../common/User/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { faPen, faSquarePlus, faCopy } from '@fortawesome/free-solid-svg-icons';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../common/ApiService/api-service';
import { Crypto } from '../common/Crypto/crypto';
import { toast as superToast } from 'bulma-toast'
import { Utils } from '../common/Utils/utils';


@Component({
  selector: 'app-vault',
  templateUrl: './vault.component.html',
  styleUrls: ['./vault.component.css']
})
export class VaultComponent implements OnInit {
  faPen = faPen;
  faSquarePlus = faSquarePlus;
  faCopy = faCopy;
  vault: Map<string, Map<string,string>> | undefined;
  vaultDomain : string[] = [];
  remainingTime = 0;
  totp = require('totp-generator');
  isModalActive = false

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private crypto: Crypto,
    private utils: Utils,
    ) { let property = new Map<string, string>();
      /*property.set("color","info");
      property.set("name", "fake@google.com")
      let vault = this.userService.getVault();
      if(vault == null){
        vault = new Map<string, Map<string,string>>();
      }
      vault.set('bb2ff042-8422-41b0-bd2e-72a949d6bccc', property);
      property = new Map<string, string>();
      property.set("name", "fake@github.com")
      property.set("secret", "GEZDGNBSGEZDGMZS");
      property.set("color","primary");
      vault.set('2ebb9281-f89f-410a-920a-8ea38e7e65c1', property);
      this.userService.setVault(vault); 
      this.userService.setId(1);*/
    }

  ngOnInit() {
    if(this.userService.getId() == null){
      this.router.navigate(["/login/sessionKilled"], {relativeTo:this.route.root});
    } else {
      this.vault = new Map<string, Map<string,string>>();
      this.http.get(ApiService.API_URL+"/all_secrets",  {withCredentials:true, observe: 'response'}).subscribe((response) => {
        try{
          const data = JSON.parse(JSON.stringify(response.body))
          console.log(data)
         if(this.userService.get_zke_key() != null){
          try{
            this.startDisplayingCode()
            for (let secret of data.enc_secrets){
              this.crypto.decrypt(secret.enc_secret, this.userService.get_zke_key()!).then((dec_secret)=>{
                if(dec_secret == null){
                  superToast({
                    message: "Wrong key. You cannot decrypt one of the secrets. Displayed secrets can not be complete. Please log out  and log in again.",
                    type: "is-danger",
                    dismissible: false,
                    duration: 20000,
                  animate: { in: 'fadeIn', out: 'fadeOut' }
                  });
                  let fakeProperty = new Map<string, string>();
                  fakeProperty.set("color","info");
                  fakeProperty.set("name", "🔒")
                  fakeProperty.set("secret", "");

                  this.vault?.set(secret.uuid, fakeProperty);
                } else {
                    try{
                      this.vault?.set(secret.uuid, this.utils.mapFromJson(dec_secret));
                      console.log(this.vault)
                      this.userService.setVault(this.vault!);
                      this.vaultDomain = Array.from(this.vault!.keys()) as string[];
                      console.log("vault set")
                    } catch {
                      superToast({
                        message: "Wrong key. You cannot decrypt one secret. This secret will be ignored. Please log   out and log in again.   ",
                        type: "is-danger",
                        dismissible: false,
                        duration: 20000,
                      animate: { in: 'fadeIn', out: 'fadeOut' }
                      });
                    }
                  }
              })
            }
            
          } catch {
            superToast({
              message: "Wrong key. You cannot decrypt this vault.",
              type: "is-danger",
              dismissible: false,
              duration: 20000,
            animate: { in: 'fadeIn', out: 'fadeOut' }
            });
          }
        } else {
          superToast({
            message: "Impossible to decrypt your vault. Please log out and log in again.",
            type: "is-danger",
            dismissible: false,
            duration: 20000,
          animate: { in: 'fadeIn', out: 'fadeOut' }
          });
        }
        } catch(e){
          superToast({
            message: "Error : Impossible to retrieve your vault from the server",
            type: "is-danger",
            dismissible: false,
            duration: 20000,
          animate: { in: 'fadeIn', out: 'fadeOut' }
          });
        }
      }, (error) => {
        if(error.status == 404){
          this.userService.setVault(new Map<string, Map<string,string>>());
        } else {
          let errorMessage = "";
          if(error.error.message != null){
            errorMessage = error.error.message;
          } else if(error.error.detail != null){
            errorMessage = error.error.detail;
          }
          superToast({
            message: "Error : Impossible to retrieve your vault from the server. "+ errorMessage,
            type: "is-danger",
            dismissible: false,
            duration: 20000,
          animate: { in: 'fadeIn', out: 'fadeOut' }
          });
        }
      });
    }    
  }

  startDisplayingCode(){
        console.log("vault = ", this.vaultDomain)
        setInterval(()=> { this.generateTime() }, 20);
        setInterval(()=> { this.generateCode() }, 100);
  }

  navigate(route:string){
    this.router.navigate([route], {relativeTo:this.route.root});
   
  }

  generateTime(){
    const duration = 30 - Math.floor(Date.now() / 10 % 3000)/100;
    this.remainingTime = (duration/30)*100
  }

  generateCode(){
    for(let domain of this.vaultDomain){
      const secret = this.vault!.get(domain)!.get("secret")!;
      try{
        let code=this.totp(secret); 
        this.vault!.get(domain)!.set("code", code);
      } catch (e){
        let code = "Error"
        this.vault!.get(domain)!.set("code", code);
      }
   
    }


  }

  edit(domain:string){
    this.router.navigate(["/vault/edit/"+domain], {relativeTo:this.route.root});
  }

  copy(){
    superToast({
      message: "Copied !",
      type: "is-success",
      dismissible: true,
    animate: { in: 'fadeIn', out: 'fadeOut' }
    });
  }

  


}
