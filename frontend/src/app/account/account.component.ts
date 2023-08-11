import { Component, OnInit } from '@angular/core';
import { toast as superToast } from 'bulma-toast'
import { faEnvelope, faLock,  faCheck, faUser, faCog} from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../common/User/user.service';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../common/ApiService/api-service';
import { Utils } from '../common/Utils/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { Crypto } from '../common/Crypto/crypto';
import { Buffer } from 'buffer';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  faUser=faUser;
  faEnvelope=faEnvelope;
  faLock=faLock;
  faCheck=faCheck;
  faCog=faCog;
  isDeletionModalActive=false;
  isPassphraseModalActive=false;
  buttonLoading = {"email":0, "username":0, "passphrase":0, "deletion":0}
  username:string="";
  usernameErrorMessage="";
  email:string="";
  confirmEmail:string="";
  emailErrorMessage="";
  emailConfirmErrorMessage="";
  newPassword="";
  confirmNewPassword="";
  newPasswordErrorMessage : [string]=[""];
  newPasswordConfirmErrorMessage : [string]=[""];
  step =0;
  password="";
  constructor(
    private http: HttpClient,
    public userService: UserService,
    private utils: Utils,
    private router: Router,
    private route: ActivatedRoute,
    private crypto:Crypto
    ){}

  
  ngOnInit(): void {
     if(this.userService.getId() == null){
       this.router.navigate(["/login/sessionKilled"], {relativeTo:this.route.root});
       if("email" in this.buttonLoading){

       }
    } 
  }

  checkUsername(){
  this.usernameErrorMessage = "";
  if(this.username != this.utils.sanitize(this.username)){
    this.usernameErrorMessage = "&, <, >, \" and ' are forbidden";
      return;
    }
  }

  changeUsername(){
    //TO DO
  }

  checkEmail(){
    this.emailErrorMessage = "";
    this.emailConfirmErrorMessage="";
    const emailRegex = /\S+@\S+\.\S+/;
    if(!emailRegex.test(this.email)){
      this.emailErrorMessage = "Are your sure about your email ?";
      return;
    } if(this.email != this.utils.sanitize(this.email)) {
      this.emailErrorMessage = "&, <, >, \" and ' are forbidden";
      return;
    } if(this.email != "" && this.confirmEmail != "" && this.email != this.confirmEmail) {
      this.emailConfirmErrorMessage = "Your emails do not match !";
      return;
    } else {
      return true;
    }
  }

  updateEmail(){
    if(this.email == ""){
      superToast({
        message: "Did you forget to fill something ?",
        type: "is-danger",
        dismissible: true,
        animate: { in: 'fadeIn', out: 'fadeOut' }
      });
      return;
    }
    if(!this.checkEmail()){
      return;
    }
    this.buttonLoading["email"] = 1
    const data = {
      email: this.email
    }
    this.http.put(ApiService.API_URL+"/update/email",  data, {withCredentials: true, observe: 'response'}).subscribe((response) => {
      this.buttonLoading["email"] = 0
      superToast({
        message: "Email updated with success",
        type: "is-success",
        dismissible: true,
        animate: { in: 'fadeIn', out: 'fadeOut' }
      });
      this.userService.setEmail(JSON.parse(JSON.stringify(response.body))["message"])
    }, error =>{
      this.buttonLoading["email"] = 0
      if(error.error.message == undefined){
        error.error.message = "Something went wrong. Please try again later";
      }
      superToast({
        message: "Error : "+ error.error.message,
        type: "is-danger",
        dismissible: true,
      animate: { in: 'fadeIn', out: 'fadeOut' }
      });
    });
  }

  checkNewPassword(){
    this.newPasswordErrorMessage=[""];
    this.newPasswordConfirmErrorMessage=[""];
    const special = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
    const upper = /[A-Z]/;
    const number = /[0-9]/;
    const forbidden = /["\'<>]/
    let isOk = true;
    if(this.password == ""){
      superToast({
        message: "We need your former passphrase to update your passphrase",
        type: "is-danger",
        dismissible: false,
        duration: 20000,
        animate: { in: 'fadeIn', out: 'fadeOut' }
      });
      isOk = false;
    }
    if(forbidden.test(this.newPassword)){
      this.newPasswordErrorMessage.push("' \" < > characters are forbidden in passwords");
      isOk = false;
    }
    if(this.newPassword.length < 8){
      this.newPasswordErrorMessage.push("Your password must be at least 8 characters long");
      isOk = false;
    }
    else if(this.newPassword.length > 70){
      this.newPasswordErrorMessage.push("Password must be less than 70 characters long");
      isOk = false;
    }
    if(!special.test(this.newPassword)){
      this.newPasswordErrorMessage.push("Your password must contain at least one special character");
      isOk = false;
    }
    if(!upper.test(this.newPassword)){
      this.newPasswordErrorMessage.push("Your password must contain at least one uppercase character");
      isOk = false;
    }
    if(!number.test(this.newPassword)){
      this.newPasswordErrorMessage.push("Your password must contain at least one number");
      isOk = false;
    }
    if(this.newPassword != "" && this.confirmNewPassword != "" && this.newPassword != this.confirmNewPassword){
      this.newPasswordConfirmErrorMessage.push("Your passwords do not match");
      isOk = false;
    }
    return isOk;
  }


  deleteAccount(){
    this.buttonLoading['deletion'] =1
  }

  updatePassphrase(){
    this.step=0;
    this.buttonLoading["passphrase"] = 0
    if(!this.checkNewPassword()){
      return;
    }

    this.passphraseModal();
  }

  updatePassphraseConfirm(){
    this.buttonLoading["passphrase"] = 1
    this.step = 0;
    this.hashPassword().then(hashed => {
      this.verifyPassword(hashed).then(_ => {
          this.step++;
          this.get_all_secret().then(vault => {
            this.step++;
            this.deriveNewPassphrase().then(derivedKey => {
              const derivedKeySalt = this.crypto.generateRandomSalt();
              const zke_key_str = this.crypto.generateZKEKey();
              console.log("zke_key_str", zke_key_str)
                this.step++;
                this.encryptVault(vault, zke_key_str, derivedKeySalt).then(enc_vault => {
                  console.log("enc_vault", enc_vault)
                  this.crypto.encrypt(zke_key_str , derivedKey, derivedKeySalt).then((enc_zke_key) => {
                    console.log("enc_zke_key", enc_zke_key)
                    this.verifyEncryption(derivedKey, enc_zke_key, enc_vault, vault).then(_ => {
                      this.step++;
                    }, error =>{
                      this.updateAborted('#6. Reason : '+error)
                    });
                  }, error =>{
                    console.log(error)
                    this.updateAborted('#5')
                  });
                }, error =>{
                  this.updateAborted('#4')
                });
            }, error =>{
              this.updateAborted('#3')
            });
          }, error =>{
            this.updateAborted('#2')
          });
        });
      }, error => {
        this.updateAborted('#1')
      });
  }

  updateAborted(errorCode: string){
    superToast({
      message: "An error occured. No update has been made. Update aborted. Report the error code " + errorCode,
      type: "is-danger",
      dismissible: false,
      duration: 20000,
      animate: { in: 'fadeIn', out: 'fadeOut' }
    });
  }



  hashPassword(): Promise<string>{
    return new Promise<string>((resolve, reject) => {
    const salt = this.userService.getPassphraseSalt();
    if (salt == null){
      this.router.navigate(["/login/sessionKilled"], {relativeTo:this.route.root});
    } else {
      this.crypto.hashPassphrase(this.password, salt).then  (hashed => {
        if(hashed != null){
            resolve(hashed);
        } else {
          superToast({
            message: "An error occured while hashing your password. Please, try again",
            type: "is-danger",
            dismissible: false,
            duration: 20000,
            animate: { in: 'fadeIn', out: 'fadeOut' }
          });
            reject("hashed is null");
        }
      });
      }
    });
  }

  verifyPassword(hashedPassword:string):Promise<string>{
    return new Promise<string>((resolve, reject) => {
      const data = {
      email: this.userService.getEmail()!,
      password: hashedPassword
    }
      this.http.post(ApiService.API_URL+"/login",  data, {withCredentials: true, observe: 'response'}).subscribe((response) => {
      resolve("ok");
      },
     (error) => {
       superToast({
         message: "Your passphrase is incorrect",
         type: "is-danger",
         dismissible: true,
       animate: { in: 'fadeIn', out: 'fadeOut' }
       });
       reject(error)
     });
    });
  }


  get_all_secret():Promise<Map<string, Map<string,string>>>{
    return new Promise<Map<string, Map<string,string>>>((resolve, reject) => {
      let vault = new Map<string, Map<string,string>>();
      this.http.get(ApiService.API_URL+"/all_secrets",  {withCredentials:true, observe: 'response'}).subscribe((response) => {
        this.step++;
        try{
          const data = JSON.parse(JSON.stringify(response.body))
          console.log(data)
         if(this.userService.get_zke_key() != null){
          try{
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
                  reject("dec_secret is null");
                } else {
                    try{
                      vault.set(secret.uuid, this.utils.mapFromJson(dec_secret));
                    } catch(e) {
                      superToast({
                        message: "Wrong key. You cannot decrypt one secret. This secret will be ignored. Please log   out and log in again.   ",
                        type: "is-danger",
                        dismissible: false,
                        duration: 20000,
                      animate: { in: 'fadeIn', out: 'fadeOut' }
                      });
                      reject(e)
                    }
                  }
              })
            }
            resolve(vault)
          } catch(e) {
            superToast({
              message: "Wrong key. You cannot decrypt this vault.",
              type: "is-danger",
              dismissible: false,
              duration: 20000,
            animate: { in: 'fadeIn', out: 'fadeOut' }
            });
            reject(e)
          }
        } else {
          superToast({
            message: "Impossible to decrypt your vault, you're decryption key has expired. Please log out and log in again.",
            type: "is-danger",
            dismissible: false,
            duration: 20000,
          animate: { in: 'fadeIn', out: 'fadeOut' }
          });
          reject("zke_key is null");
        }
        } catch(e){
          superToast({
            message: "Error : Impossible to retrieve your vault from the server",
            type: "is-danger",
            dismissible: false,
            duration: 20000,
          animate: { in: 'fadeIn', out: 'fadeOut' }
          });
          reject(e)
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
          reject(error)
        }
      });
  });
}

deriveNewPassphrase():Promise<CryptoKey>{
  return new Promise<CryptoKey>((resolve, reject) => {
    this.crypto.deriveKey(this.newPassword, this.userService.getPassphraseSalt()!).then((derivedKey) => {
      resolve(derivedKey);
    }, error => {
      superToast({
        message: "Error : Impossible to derive your new passphrase",
        type: "is-danger",
        dismissible: false,
        duration: 20000,
      animate: { in: 'fadeIn', out: 'fadeOut' }
      });
      reject(error)
    });
  });
}

  encryptVault(vault:Map<string, Map<string,string>>, zkeKey_str: string, zkeSalt:string):Promise<Map<string, string>>{
    return new Promise<Map<string, string>>((resolve, reject) => {
      try{
      const zke_key_raw = Buffer.from(zkeKey_str, "base64");
      window.crypto.subtle.importKey(
        "raw",
        zke_key_raw,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
      ).then((zke_key)=>{
      const enc_vault = new Map<string, string>();
      for(let [uuid, property] of vault){
        try{
          this.crypto.encrypt(this.utils.mapToJson(property), zke_key, zkeSalt).then(enc_property => {
            enc_vault.set(uuid, enc_property);
          });
        } catch(e) {
          superToast({
            message: "Error : Impossible to encrypt your vault",
            type: "is-danger",
            dismissible: false,
            duration: 20000,
          animate: { in: 'fadeIn', out: 'fadeOut' }
          });
          reject(e)
        }
      }
      resolve(enc_vault);
    });
  } catch(e){
    console.log(e)
  }
  });
  }


  verifyEncryption(derivedKey:CryptoKey, zke_enc:string, enc_vault: Map<string, string>, vault:Map<string, Map<string,string>>):Promise<string>{
    return new Promise<string>((resolve, reject) => {
     this.crypto.decrypt(zke_enc, derivedKey).then((zke_key_str) => {
      if(zke_key_str != null){
        try {
          for (let uuid of enc_vault.keys()){
            if(enc_vault.get(uuid) != undefined){
            this.crypto.decrypt(enc_vault.get(uuid)!, this.userService.get_zke_key()!).then((dec_secret)=>{
              if(dec_secret == null){
                reject("dec_secret is null");
              } else {
                try{
                  const secret = this.utils.mapFromJson(dec_secret).get("secret");
                  if(secret != vault.get("uuid")!.get("secret")){
                    reject("secret is different")
                  }
                } catch(e) {
                  reject(e)
                }
                }
            })
          }else {
            reject("enc_vault.get(uuid) is undefined")
          }
        } 
        resolve("ok")
        } catch(e){
          reject(e)
        }

      } else {
        reject("zke_key_str is null")
      }
     });
    });

  }

  





  deletionModal(){
    if(!this.buttonLoading["deletion"]){
      this.isDeletionModalActive = !this.isDeletionModalActive;
    }
  }

  passphraseModal(){
    if(!this.buttonLoading["passphrase"]){
      this.isPassphraseModalActive = !this.isPassphraseModalActive;
    }
  }

}


