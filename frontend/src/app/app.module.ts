import { NgModule, CSP_NONCE } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClientModule,HttpClient } from '@angular/common/http';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './login/login.component';
import { VaultComponent } from './vault/vault.component';
import { UserService } from './common/User/user.service';
import { Utils } from './common/Utils/utils';
import { EditTOTPComponent } from './edit-totp/edit-totp.component';
import { LogoutComponent } from './logout/logout.component';
import { Crypto } from './common/Crypto/crypto';
import { FooterComponent } from './footer/footer.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { QrcodeReaderComponent } from './qrcode-reader/qrcode-reader.component';
import { QrCodeTOTP } from './common/qr-code-totp/qr-code-totp.service';
import { DevComponent } from './dev/dev.component';
import { AccountComponent } from './account/account.component';
import { LocalVaultV1Service } from './common/upload-vault/LocalVaultv1Service.service';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { BnNgIdleService } from 'bn-ng-idle'; 
import { ChangelogComponent } from './changelog/changelog.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { CallbackComponent } from './callback/callback.component';
import { OauthSyncComponent } from './oauth-sync/oauth-sync.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { OpenSourceLibraryComponent } from './open-source-library/open-source-library.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateService, MissingTranslationHandler, MissingTranslationHandlerParams, } from '@ngx-translate/core';
import defaultLanguage from "./../assets/i18n/en-uk.json";


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export class MissingTranslationHelper implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    return '|•••| <-- this is a missing translation. Sorry about that !';
  }
}



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SignupComponent,
    NavbarComponent,
    LoginComponent,
    VaultComponent,
    EditTOTPComponent,
    LogoutComponent,
    FooterComponent,
    PagenotfoundComponent,
    QrcodeReaderComponent,
    DevComponent,
    AccountComponent,
    PrivacyPolicyComponent,
    ChangelogComponent,
    AdminPageComponent,
    CallbackComponent,
    OauthSyncComponent,
    PreferencesComponent,
    OpenSourceLibraryComponent,
    EmailVerificationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FontAwesomeModule,
    HttpClientModule, 
    ClipboardModule,
    ZXingScannerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslationHelper
      },
    }),
    HttpClientModule,
  ],
  providers: [UserService, Utils, Crypto, QrCodeTOTP, LocalVaultV1Service, BnNgIdleService, {
    provide: CSP_NONCE,
    useValue: 'random-nonce-placeholder'
  }],
  bootstrap: [AppComponent]
})
export class AppModule { 

  constructor(translate: TranslateService) {
    translate.addLangs(['fr-fr']);
    translate.setTranslation('en-uk', defaultLanguage);
    translate.setDefaultLang('en-uk');
    if(localStorage.getItem('language') == null){
      const browserLang = translate.getBrowserLang();
      if(browserLang == undefined){
        localStorage.setItem('language','en-uk');
        translate.use('en-uk');
      } else if(browserLang.match(/fr/)){
        localStorage.setItem('language','fr-fr');
        translate.use('fr-fr');
      } else { // default + en
        localStorage.setItem('language','en-uk');
        translate.use('en-uk');
      }
    } else {
      if(localStorage.getItem('language') == 'fr-fr'){
        translate.use('fr-fr');
      } else { // default + en
        translate.use('en-uk');
      }
    }
    translate.use('en-uk');
  }
}


