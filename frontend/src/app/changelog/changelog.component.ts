import { Component } from '@angular/core';
import { faCirclePlus, faTruckMedical } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.css']
})
export class ChangelogComponent {
  faCirclePlus = faCirclePlus;
  faTruckMedical = faTruckMedical;
  imageHash = environment.imageHash;

  changelogs = [
    {
      date: "13/04/2024",
      version: "b2.9",
      added: [
        "You can now add tags to your secrets to easily finds them in your vault.",
        "We improved the login flow to be less confusing when the user successfully logs in after several failed attempts.",
      ],
      fixed:[
        "We updated our dependencies to fix a moderate CVE.",
      ]
    },
    {
      date: "05/04/2024",
      version: "b2.8",
      added: [
        "The signup flow has been improved to be less heavy and don't require the user to enter too much their passphrase",
      ],
      fixed:[
        "We updated our dependencies to fix 2 moderate CVE.",
        "We fixed a bug causing the session to timeout before 10min of inactivity."
      ]
    },
    {
      date: "18/03/2024",
      version: "b2.7",
      added: [
        "We improve the style and options of informational and errors toasts and reduce the code complexity.",
      ],
      fixed:[
        "We improve the edit TOTP code page, especially when the TOTP secret is invalid or malformed in a way the user understands the problem and can fix it more easily.",
        "We updated our dependencies to fix a moderate CVE."
      ]
    },
    {
      date: "02/03/2024",
      version: "b2.6",
      added: [
        "You can now ask your browser to remember your email address when you log in.",
      ],
      fixed:[
       
      ]
    },
    {
      date: "11/02/2024",
      version: "b2.5",
      added: [
        "We added a new search bar in the vault page to easily find your TOTP codes.",
      ],
      fixed:[
       
      ]
    },
    {
      date: "05/02/2024",
      version: "b2.4",
      added: [
      ],
      fixed:[
        "We upgrade some of our dependencies to fix 2 vulnerabilities."
      ]
    },
    {
      date: "26/01/2024",
      version: "b2.3",
      added: [
      ],
      fixed:[
        "We improve the 'add new TOTP code' UX to be more user-friendly and to avoid any confusion in the application.",
      ]
    },
    {
      date: "22/01/2024",
      version: "b2.2",
      added: [
       "We improved the protection of your accounts with rate limiting for abusing user or attack attempts.",
      ],
      fixed:[
        "We fixed potential injection of css class while displaying your vault.",
        "Improvement of the handling of favicon domain name to prevent any attempt of side-attack.",
        "We fixed a bug in the Google Drive integration causing the synchronization to be ephemeral when the user had previously revoked the access to Zero-TOTP directly from their Google Drive account instead of in the application.",
      ]
    },
    {
      date: "20/01/2024",
      version: "b2.1",
      added: [
       "You can now update your username in your account settings.",
      ],
      fixed:[
        "We fixed the behavior of Google Drive backups if the backup folder is trashed. If you trash the backup folder, Zero-TOTP will create a new one and continue to backup your vault in the new folder. To disable the backup, just tap 'stop sync', below the Google Drive storage option, in your vault page.",
      ]
    },
    {
      date: "19/01/2024",
      version: "b2.0",
      added: [
       "We added the support of french language in the application. You can now switch between english and french in the preferences page.",
       "We improved our app structure to facilitate the integration of new languages in the future.",
      ],
      fixed:[
      ]
    },
    {
      date: "11/01/2024",
      version: "b1.10",
      added: [
       "We added a warning page for browsers that doesn't support javascript. Without javascript, Zero-TOTP is not usable.",
      ],
      fixed:[
        "We fixed a bug in the TOTP editing page causing the saving to be impossible if the secret contained one or multiple whitespaces.",
        "We fixed 3 moderate vulnerabilities in our dependencies.",
        "We improved the security of the email verification process with a shorter code to be more easy to type with a limit of time and a new limit of attempts.",
      ]
    },
    {
      date: "18/12/2023",
      version: "b1.9",
      added: [
        "We added some improvement for the admin panel with the ability to block user and gain more information about them. The information are still limited to the non-discriminent and we will never be able to see your secrets.",
        "You can now visualize your passphrase while typing it in every inputs.",
        "We added a little tag to feature not yet implemented in the application."
      ],
      fixed:[
        "We fixed the minimum length of the passphrase to 12 characters.",
        "We fixed a bug in the TOTP editing page form validation causing the saving to be possible even if some data were invalid.",
        "Fixed a bug in the buy me a coffee page"
      ]
    },
    {
      date: "18/12/2023",
      version: "b1.8",
      added: [
        "We now send security information by mail for security events such as password change, email change.",
      ],
      fixed:[]
    },
    {
      date: "06/12/2023",
      version: "b1.7",
      added: [
        "We added a new layer of security : the email verification. It is now mandatory for every user to verify their email address. This process will limit the creation of automatic accounts and will improve the security of the application. In case of some critical actions, such as changing the master passphrase or the email address, this contact can be used in the future as a second factor of authentication.",
      ],
      fixed:[]
    },
    {
      date: "01/12/2023",
      version: "b1.6",
      added: [
        "We added a new page to list and be transparent about the open-source libraries we use in Zero-TOTP. You can find this page in the footer."
      ],
      fixed:[]
    },
    {
      date: "20/11/2023",
      version: "b1.5",
      added: [
        "You can now completely delete your account, including all your data. You can delete your account in your account settings.",
       "We improved the security surrounding admins.",
        "Rescue Zero-TOTP is now available for all. This version includes the integration of rescue.zero-totp.com in case of problems."
      ],
      fixed:["We patched CVE-2023-49083 (critical) from the python 'cryptography' library."]
    },
    {
      date: "20/11/2023",
      version: "b1.4",
      added: [
      ],
      fixed:[
        "A bug when opening the vault for the first time, the google drive status was stuck in loading status.",
        "We improve the database initialization on app startup.",
        "We improve the vault import via a zero-totp backup file.",
        "We improve the way we display time, to be more accurate according to your timezone. We fixed a bug when backuping your vault, the last backup up was not displayed.",
        "We fixed a bug in the adding a secret section causing the save button to be disabled even if the form was valid.",
        "We fixed the 'Reload my vault' button in your storage options which wasn't working properly.",
        "We improve the userflow when updating your passphrase, showing you multiple options if you have backups in your google drive."]
    },
    {
      date: "19/11/2023",
      version: "b1.3",
      added: [
        "We migrated the API from an WSGI server to a ASGI server to improve the performance of the application. As for now, the API is 20% faster and can handle more requests at the same time.",
        "We upgraded Zero-TOTP's API to Flask 3.0, connexion 3.0 to improve the performance and security of the application. This is an important upgrade in the maintainability and futur development of the application."
      ],
      fixed:[
        "We upgraded all the dependencies of the API to keep Zero-TOTP secure. In particular, the API is now protected against CVE-2023-46136 (moderate), CVE-2023-45803 (moderate) and CVE-2023-43804 (moderate)."]
    },
    {
      date: "18/11/2023 ",
      version: "b1.2",
      added: [
        "A full new section to manage your preferences and settings. The advances settings are now in this dedicated page.",
        "We added a whole new feature to Zero-TOTP : the favicon preview. You can now see the favicon of the website you are adding to your vault. It is easier to identify the website you are adding to your vault.",
        "You can enable or disable the favicon preview for each website in their settings. If you want to define a global setting for all your websites, you can do it in the preferences page. You can enable the favicon preview for all your websites or disable it for all your websites. This setting overriddes the website settings."
      ],
      fixed:[
       ]
    },
    {
      date: "09/11/2023 ",
      version: "b1.0",
      added: [
        "Your can now enable the automatic backup of your encrypted vault right into your Google Drive account in few clicks. After each modification to your vault an encrypted backup is automatically triggered and saved in your Google Drive account. You now have the control over your backups and stores them in a safe place. All backups are always encrypted with your passphrase and no one can open them without it. Even if someone has access to your Google Drive account.",
        "A full integration with Google Drive API to allow you to backup your vault in your Google Drive account through an OAuth2 authentication.",
        "A full control of your integration settings, directly from the vault page. You can enable or revoke the google drive backup, manage errors, or see the last backup date.",
        "We have designed a entire secure flow through the application to easily connect your google drive account within few clicks.",
        "We added an important new security layer to safely store your google drive access.",
        "We added a cleaning routine to manage for you the backup files in your google drive account.",
        "This new version includes a version control and integrity of your backups to always keep your backups up to date.",
        "We added new settings in your account page to see the whole backup retention policy. You will be able to manage it in futur releases.",
        "You can verify at any moment your google drive integration status right in your vault page.",
        "We updated the privacy policy to be more clearer about the google drive integration.",
        "This version brings a whole new dimension to Zero-TOTP and include a very important security layer for your vault to keep your data safe."
      ],
      fixed:[
       ]
    },
    {
      date: "31/10/2023",
      version: "b0.49",
      added: [
       
      ],
      fixed:[
        "We've made some improvement to the published docker images to be more secure and stable.",
        "You can now retrieve a specific version in dockerhub with its appropriate tag.",
        "We deleted a lot of debug logs to improve the application performance and avoid any security leak in your logs."
       ]
    },
    {
      date: "27/10/2023",
      version: "b0.48",
      added: [
        "A very strong and strict Content-Security-Policy (CSP) to add an extra layer of security to Zero-TOTP, particularly against XSS attacks, clickjacking, XSF, etc.",
        "This strict new policy is applied to all pages of Zero-TOTP and may cause some visual perturbations on some browsers. If you encounter any issue, please contact us. We will deeply test the application and apply some fixes if needed in futur releases.",
        "We upgraded our base image for the Zero-TOTP API's to improve the security of the application.",
      ],
      fixed:[
       ]
    },
    {
      date: "24/10/2023",
      version: "b0.47",
      added: [
       
      ],
      fixed:[
        'We added a better verification of your inputs to improve the application security at a very global scale.',
        'We added a strong sanitizing of all inputs to avoid any security issue.',
        'The "confirm your passphrase is strong" pop-up is now showed only once, even if your signup form has an error.You can now re-submit a signup without having to fill the pop-up again.',
        'As for now, if your session is expired or if you don\'t have internet anymore, the frontend can adapt to display more accurate error message and send you to the login page if your 1h session is ended.',
        'The "Create my vault" button on the home page is now "Open my vault" and leads to the login page instead. It is more convenient for most of users.',

       ]
    },
    {
      date: "23/10/2023",
      version: "b0.46",
      added: [
       "A very basic admin dashboard to visualize users (for admins only). Admins will never be able to modify view or modify users' data.",
       "We added a new login flow to secure the admin authentification."
      ],
      fixed:[
        "We've made some upgrades to always use the most stable packages.",
       ]
    },
    {
      date: "18/10/2023",
      version: "b0.45",
      added: [
      ],
      fixed:[
        "We've made some update of our dependencies to keep Zero-TOTP secure.",
       ]
    },
    {
      date: "16/10/2023",
      version: "b0.44",
      added: [
        "This changelog page.",
      ],
      fixed:[
       
       ]
    },
    {
      date: "16/10/2023",
      version: "b0.43",
      added: [
        "Zero-TOTP servers are now hosted in France and in Canada to improve the data redundancy.",
      ],
      fixed:[
       
       ]
    },
  ]

}
