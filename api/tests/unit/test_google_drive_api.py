import unittest
from environment import conf
from unittest.mock import patch
from Oauth import google_drive_api  
import datetime
import Utils.utils as utils
from database.user_repo import User as UserRepo
from database.zke_repo import ZKE as ZKE_encryption_key_repo
from database.totp_secret_repo import TOTP_secret as TOTP_secret_repo
from database.google_drive_integration_repo import GoogleDriveIntegration as GoogleDriveIntegration_repo
from database.db import db
from uuid import uuid4
from CryptoClasses import jwt_func
from app import app
import json
from base64 import b64decode, b64encode




class TestGoogleDriveAPI(unittest.TestCase):
        
        
        class MockedDriveService():
            mockedFiles = None
            def __init__(self, mockedFiles):
                self.mockedFiles= mockedFiles;
            
            def files(self):
                return self;
            def list(self, **kwargs):
                return self;
            def execute(self):
                  return self.mockedFiles;
            def get_media(self, **kwargs):
                    return self;
            def update(self, **kwargs):
                    return self;
            def create(self, **kwargs):
                    return self;

    
        def setUp(self):
            if conf.database.database_uri != "sqlite:///:memory:":
                raise Exception("Test must be run with in memory database")
            self.application = app
            self.jwtCookie = jwt_func.generate_jwt(1)
            self.client = self.application.test_client()
            self.endpoint = "/api/v1/vault/export"
            self.from_authorized_user_info = patch("google.oauth2.credentials.Credentials.from_authorized_user_info").start()
            self.from_authorized_user_info.return_value = "credentials"
            self.build = patch("Oauth.google_drive_api.build").start()
            self.mockedFiles = {'files': []}
            self.drive = self.MockedDriveService(mockedFiles=self.mockedFiles)
            self.build.return_value = self.drive

            user_repo = UserRepo()
            zke_repo = ZKE_encryption_key_repo()
            totp_repo = TOTP_secret_repo()
            self.google_integration_db = GoogleDriveIntegration_repo()
            with self.application.app.app_context():
                    db.create_all()
                    user_repo.create(username="user", email="user@test.test", password="password", 
                    randomSalt="salt",passphraseSalt="salt", isVerified=True, today=datetime.datetime.utcnow())
                    zke_repo.create(user_id=1, encrypted_key="key")
                    for i in range(10):
                        totp_repo.add(user_id=1, enc_secret="secret" + str(i), uuid=str(uuid4()))
                    self.google_integration_db.create(1, True)
                    db.session.commit()
        def tearDown(self):
          patch.stopall()
          with self.application.app.app_context():
            db.session.remove()
            db.drop_all()
        
####################
## get_drive_service
####################
        
        def test_get_drive_service(self):
              credentials = {
                    "expiry" : "2021-01-01 00:00:00.000000",
              }
              self.assertEqual(google_drive_api.get_drive_service(credentials=credentials), self.drive)

        
        def test_get_drive_service_with_already_good_date(self):
                credentials = {
                        "expiry" : "2021-01-01T00:00:00Z",
                }
                self.assertEqual(google_drive_api.get_drive_service(credentials=credentials), self.drive)

#############
## get_folder
#############

        def test_get_folder(self):
                name = "myName"
                self.execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
                self.execute.return_value = {
                    "files" : [
                        {
                            "name" : name, 
                            "explicitlyTrashed": False
                        }
                    ]
                }
                result = {
                    "files" : [
                        {
                            "name" : name,
                            "explicitlyTrashed": False
                        }
                    ]
                }
                self.assertEqual(google_drive_api.get_folder(name=name, drive=self.drive), result.get("files")[0])
        
        def test_get_folder_mutliple_folders(self):
                name = "myName"
                self.execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
                self.execute.return_value = {
                    "files" : [
                        {
                            "name" : name, 
                            "explicitlyTrashed": False
                        }, 
                        {
                            "name": "otherName",
                            "explicitlyTrashed": False
                        }
                    ]
                }
                result = {
                    "files" : [
                        {
                            "name" : name,
                            "explicitlyTrashed": False
                        }
                    ]
                }
                self.assertEqual(google_drive_api.get_folder(name=name, drive=self.drive), result.get("files")[0])
        
        def test_get_folder_not_found(self):
                name = "myName"
                self.execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
                self.execute.return_value = {
                    "files" : [
                        {
                            "name" : "anotherName", 
                            "explicitlyTrashed": False
                        }, 
                        {
                            "name": "otherName",
                            "explicitlyTrashed": False
                        }
                    ]
                }
                self.assertIsNone(google_drive_api.get_folder(name=name, drive=self.drive))

        def test_get_folder_no_folder(self):
                name = "myName"
                self.execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
                self.execute.return_value = {
                    "files" : []
                }
                self.assertIsNone(google_drive_api.get_folder(name=name, drive=self.drive))
        
        def test_get_folder_trashed(self):
                name = "myName"
                self.execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
                self.execute.return_value = {
                    "files" : [
                        {
                            "name" : name, 
                            "explicitlyTrashed": True
                        }, 
                        {
                            "name": "otherName",
                            "explicitlyTrashed": False
                        }
                    ]
                }
                self.assertIsNone(google_drive_api.get_folder(name=name, drive=self.drive))

################
## create_folder
################

        def test_create_folder(self):
               folder = {"id": 1, "name": "myFolder", "explicitlyTrashed": False}
               self.execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
               self.execute.return_value = folder
               self.assertEqual(google_drive_api.create_folder(name="myFolder", drive=self.drive), folder)
               
################
## create_file
################

        def test_create_file(self):
               file = object()
               self.execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
               self.execute.return_value = file
               self.assertEqual(google_drive_api.create_file(name="myFolder", content="test", drive=self.drive), file)
        
        def test_create_file_with_folder_id_not_existing(self):
               file = object()
               self.execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
               self.execute.return_value = file
               self.assertEqual(google_drive_api.create_file(name="myFolder", content="test", drive=self.drive, folder_id=1), file)
       
        def test_create_file_with_folder_id_existing(self):
               file = object()
               self.execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
               self.execute.return_value = file
               google_drive_api.create_folder(name="myFolder", drive=self.drive)
               self.assertEqual(google_drive_api.create_file(name="myFolder", content="test", drive=self.drive, folder_id=1), file)

#########
## backup
#########

        def test_backup(self):
             FOLDER_ID = 5
             VAULT = "vault"
             self.get_folder = patch("Oauth.google_drive_api.get_folder").start()
             self.get_folder.return_value = {"id" : FOLDER_ID}

             self.create_file = patch("Oauth.google_drive_api.create_file").start()  
             self.create_file.return_value = "file"
             
             self.assertEqual(google_drive_api.backup(credentials="creds", vault=VAULT), "file")
             self.create_file.assert_called_with(name=datetime.datetime.utcnow().strftime('%d-%m-%Y-%H-%M-%S')+"_backup", drive=self.drive, content=VAULT, folder_id=FOLDER_ID)
        
        def test_backup_with_folder_creation(self):
             VAULT = "vault"
             FOLDER_ID = 5
             def fake_create_foler(name, drive):
                 print("create foler")
                 files = {'files': [{"id" : FOLDER_ID, "name" :name, "explicitlyTrashed": False}]}
                 drive.mockedFiles =files
             create_file = patch("Oauth.google_drive_api.create_file").start()  
             create_file.return_value = "file"   
             create_folder = patch("Oauth.google_drive_api.create_folder").start()
             create_folder.side_effect = fake_create_foler
             


             
             self.assertEqual(google_drive_api.backup(credentials="creds", vault=VAULT), "file")
             create_file.assert_called_with(name=datetime.datetime.utcnow().strftime('%d-%m-%Y-%H-%M-%S')+"_backup", drive=self.drive, content=VAULT, folder_id=FOLDER_ID)

        def test_backup_with_folder_creation_error(self):
             VAULT = "vault"
             get_service = patch("Oauth.google_drive_api.get_drive_service").start()
             get_service.return_value = self.drive
             create_file = patch("Oauth.google_drive_api.create_file").start()  
             create_file.return_value = "file"
             create_folder = patch("Oauth.google_drive_api.create_folder").start()
             create_folder.return_value = {"id" : 1}
             execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
             execute.return_value = {"files" : []}
             
             self.assertRaises(Exception, google_drive_api.backup, credentials="creds", vault=VAULT)

########################
## get_files_from_folder
########################

        def test_get_files_from_folder(self):
            FOLDER_ID = 5
            self.execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
            self.execute.return_value = {
                "files" : [
                    {
                        "name" : "myName", 
                        "explicitlyTrashed": False
                    }, 
                    {
                        "name": "otherName",
                        "explicitlyTrashed": False
                    },
                    {
                        "name": "otherOtherName",
                        "explicitlyTrashed": True
                    }
                ]
            }
            result = {
                "files" : [
                    {
                        "name" : "myName", 
                        "explicitlyTrashed": False
                    }, 
                    {
                        "name": "otherName",
                        "explicitlyTrashed": False
                    },
                ]
            }
            self.assertEqual(google_drive_api.get_files_from_folder(folder_id=str(FOLDER_ID), drive=self.drive), result.get('files'))

#######################
## get_last_backup_file
#######################

       
    

        def test_get_last_backup_file(self):
            FOLDER_ID = 5
            LAST_BACKUP_FILENAME = "02-01-2023-00-00-00_backup"
            get_folder = patch("Oauth.google_drive_api.get_folder").start()
            get_folder.return_value = {"id" : str(FOLDER_ID)}
            execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
            execute.return_value = {
                "files" : [
                    {
                        "name" : "01-01-2023-00-00-00_backup", 
                        "explicitlyTrashed": False
                    }, 
                    {
                        "name": LAST_BACKUP_FILENAME,
                        "explicitlyTrashed": False
                    },
                    {
                        "name": "03-01-2023-00-00-00_backup",
                        "explicitlyTrashed": True
                    }
                ]
            }
            self.assertEqual(google_drive_api.get_last_backup_file(drive=self.drive), ({"name" : LAST_BACKUP_FILENAME, "explicitlyTrashed": False}, datetime.datetime(year=2023, month=1, day=2, hour=0, minute=0, second=0 ) ))

        def test_get_last_backup_file_without_folder(self):
            get_folder = patch("Oauth.google_drive_api.get_folder").start()
            get_folder.return_value = None
            self.assertRaises(utils.FileNotFound, google_drive_api.get_last_backup_file, drive=self.drive)
        
        def test_get_last_backup_file_with_no_file(self):
            FOLDER_ID = 5
            get_folder = patch("Oauth.google_drive_api.get_folder").start()
            get_folder.return_value = {"id" : str(FOLDER_ID)}
            execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
            execute.return_value = {"files": []}
            self.assertRaises(utils.FileNotFound, google_drive_api.get_last_backup_file, drive=self.drive)
        

        def test_get_last_backup_file_with_corrupted_file(self):
            FOLDER_ID = 5
            LAST_BACKUP_FILENAME = "02-01-2023-00-00-00_backup"
            get_folder = patch("Oauth.google_drive_api.get_folder").start()
            get_folder.return_value = {"id" : str(FOLDER_ID)}
            execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
            execute.return_value = {
                "files" : [
                    {
                        "name" : "01-01-2023-00-00-00_backup", 
                        "explicitlyTrashed": False
                    }, 
                    {
                        "name": LAST_BACKUP_FILENAME,
                        "explicitlyTrashed": False
                    },
                    {
                        "name": "bad_filename",
                        "explicitlyTrashed": False
                    },
                    {
                        "name": "03-01-2023_00-00-00_backup",
                        "explicitlyTrashed": False
                    },
                    {
                        "name": "03-01-2023-00-00-00_backup",
                        "explicitlyTrashed": True
                    }
                ]
            }
            self.assertEqual(google_drive_api.get_last_backup_file(drive=self.drive), ({"name" : LAST_BACKUP_FILENAME, "explicitlyTrashed": False}, datetime.datetime(year=2023, month=1, day=2, hour=0, minute=0, second=0 ) ))
        
        def test_get_last_backup_file_with_all_files_trashed(self):
            FOLDER_ID = 5
            LAST_BACKUP_FILENAME = "02-01-2023-00-00-00_backup"
            get_folder = patch("Oauth.google_drive_api.get_folder").start()
            get_folder.return_value = {"id" : str(FOLDER_ID)}
            execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
            execute.return_value = {
                "files" : [
                    {
                        "name" : "01-01-2023-00-00-00_backup", 
                        "explicitlyTrashed": True
                    }, 
                    {
                        "name": LAST_BACKUP_FILENAME,
                        "explicitlyTrashed": True
                    },
                    {
                        "name": "03-01-2023-00-00-00_backup",
                        "explicitlyTrashed": True
                    }
                ]
            }
            self.assertRaises(utils.FileNotFound, google_drive_api.get_last_backup_file, drive=self.drive)
    
        
###########################
## get_last_backup_checksum
###########################

        def test_get_last_backup_checksum(self):
            LAST_BACKUP_FILENAME = "02-01-2023-00-00-00_backup"
            get_last_backup_file = patch("Oauth.google_drive_api.get_last_backup_file").start()
            get_last_backup_file.return_value = {"name" : LAST_BACKUP_FILENAME, "explicitlyTrashed": False, "id":1}, datetime.datetime(year=2023, month=1, day=2, hour=0, minute=0, second=0 )
            with self.application.app.app_context():
                self.client.cookies = {"api-key":self.jwtCookie}
                response = self.client.get(self.endpoint)
                print("json=" , response.json())
                execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
                execute.return_value = response.json().encode("utf-8")
                try:
                    json_str = b64decode(response.json().split(",")[0])
                    json_obj = json.loads(json_str)
                except:
                    raise Exception("json not valid")
                self.assertEqual(google_drive_api.get_last_backup_checksum("creds"), (json_obj["secrets_sha256sum"], datetime.datetime(year=2023, month=1, day=2, hour=0, minute=0, second=0 )) )
        
        def test_get_last_backup_no_checksum(self):
            LAST_BACKUP_FILENAME = "02-01-2023-00-00-00_backup"
            get_last_backup_file = patch("Oauth.google_drive_api.get_last_backup_file").start()
            get_last_backup_file.return_value = {"name" : LAST_BACKUP_FILENAME, "explicitlyTrashed": False, "id":1}, datetime.datetime(year=2023, month=1, day=2, hour=0, minute=0, second=0 )
            execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
            false_vault = b64encode('{"date" : "2023-01-02 00:00:00.000000", "name": "no_checksum"}'.encode("utf-8")).decode("utf-8")
            execute.return_value = f'{false_vault},data'.encode("utf-8")
            self.assertRaises(utils.CorruptedFile, google_drive_api.get_last_backup_checksum, "creds")
        
        def test_get_last_backup_bad_backup(self):
            LAST_BACKUP_FILENAME = "02-01-2023-00-00-00_backup"
            get_last_backup_file = patch("Oauth.google_drive_api.get_last_backup_file").start()
            get_last_backup_file.return_value = {"name" : LAST_BACKUP_FILENAME, "explicitlyTrashed": False, "id":1}, datetime.datetime(year=2023, month=1, day=2, hour=0, minute=0, second=0 )
            execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
            execute.return_value = 'badBackup,data'.encode("utf-8")
            self.assertRaises(utils.CorruptedFile, google_drive_api.get_last_backup_checksum, "creds")
            

#########################
## clean backup retention
#########################


        def test_clean_old_backup(self):
             nb_backup = 30
             
             files_deleted = []
             files_to_be_deleted = [id for id in range(1, nb_backup - 20)]
             def update_file(fileId, body):
                 files_deleted.append(fileId)
                 return self.drive
                
             get_folder = patch("Oauth.google_drive_api.get_folder").start()
             get_folder.return_value = {"id" : 1}
             get_files_from_folder = patch("Oauth.google_drive_api.get_files_from_folder").start()
             get_files_from_folder.return_value = [{"name" : f"{str(day).zfill(2)}-01-2023-00-00-00_backup", "explicitlyTrashed": False, "id": day} for day in range(1, nb_backup)]
             delete_execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
             delete_execute.return_value = True
             update = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.update").start()
             update.side_effect = update_file
             
             with self.application.app.app_context():
                self.google_integration_db.update_last_backup_clean_date(1, datetime.datetime(year=2023, day=1, month=1).strftime('%Y-%m-%d'))
                self.assertTrue(google_drive_api.clean_backup_retention("creds", 1))
                self.assertEqual(delete_execute.call_count, nb_backup - 20 - 1)
                for file in files_to_be_deleted:
                    self.assertTrue(file in files_deleted)
                self.assertEqual(self.google_integration_db.get_last_backup_clean_date(1), datetime.datetime.utcnow().strftime('%Y-%m-%d'))


        def test_clean_backup_not_enough(self):
             nb_backup = 19
             with self.application.app.app_context():
                self.google_integration_db.update_last_backup_clean_date(1, datetime.datetime(year=2023, day=1, month=1).strftime('%Y-%m-%d'))
                get_folder = patch("Oauth.google_drive_api.get_folder").start()
                get_folder.return_value = {"id" : 1}
                get_files_from_folder = patch("Oauth.google_drive_api.get_files_from_folder").start()
                get_files_from_folder.return_value = [{"name" : f"{str(day).zfill(2)}-01-2023-00-00-00_backup", "explicitlyTrashed": False, "id": day} for day in range(1, nb_backup)]
                delete_execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
                delete_execute.return_value = True
                self.assertTrue(google_drive_api.clean_backup_retention("creds", 1))
                delete_execute.assert_not_called()
                self.assertEqual(self.google_integration_db.get_last_backup_clean_date(1), datetime.datetime.utcnow().strftime('%Y-%m-%d'))
        
        def test_clean_backup_not_old_enough(self):
             nb_backup = 30
             with self.application.app.app_context():
                self.google_integration_db.update_last_backup_clean_date(1, datetime.datetime(year=2023, day=1, month=1).strftime('%Y-%m-%d'))
                today = datetime.datetime.utcnow().strftime('%m-%Y')
                get_folder = patch("Oauth.google_drive_api.get_folder").start()
                get_folder.return_value = {"id" : 1}
                get_files_from_folder = patch("Oauth.google_drive_api.get_files_from_folder").start()
                get_files_from_folder.return_value = [{"name" : f"{str(day).zfill(2)}-{today}-00-00-00_backup", "explicitlyTrashed": False, "id": day} for day in range(1, nb_backup)]
                delete_execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
                delete_execute.return_value = True
                self.assertTrue(google_drive_api.clean_backup_retention("creds", 1))
                delete_execute.assert_not_called()
                self.assertEqual(self.google_integration_db.get_last_backup_clean_date(1), datetime.datetime.utcnow().strftime('%Y-%m-%d'))
        
        def test_clean_backup_already_cleaned_today(self):
             nb_backup = 30
             with self.application.app.app_context():
                self.google_integration_db.update_last_backup_clean_date(1, datetime.datetime.utcnow().strftime('%Y-%m-%d'))
                get_folder = patch("Oauth.google_drive_api.get_folder").start()
                get_folder.return_value = {"id" : 1}
                get_files_from_folder = patch("Oauth.google_drive_api.get_files_from_folder").start()
                get_files_from_folder.return_value = [{"name" : f"{str(day).zfill(2)}-01-2023-00-00-00_backup", "explicitlyTrashed": False, "id": day} for day in range(1, nb_backup)]
                delete_execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
                delete_execute.return_value = True
                self.assertTrue(google_drive_api.clean_backup_retention("creds", 1))
                delete_execute.assert_not_called()
                self.assertEqual(self.google_integration_db.get_last_backup_clean_date(1), datetime.datetime.utcnow().strftime('%Y-%m-%d'))
        
        def test_clean_backup_no_folder(self):
             nb_backup = 30
             with self.application.app.app_context():
                self.google_integration_db.update_last_backup_clean_date(1, datetime.datetime(year=2023, day=1, month=1).strftime('%Y-%m-%d'))
                get_folder = patch("Oauth.google_drive_api.get_folder").start()
                get_folder.return_value = None
                get_files_from_folder = patch("Oauth.google_drive_api.get_files_from_folder").start()
                get_files_from_folder.return_value = [{"name" : f"{str(day).zfill(2)}-01-2023-00-00-00_backup", "explicitlyTrashed": False, "id": day} for day in range(1, nb_backup)]
                delete_execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
                delete_execute.return_value = True
                self.assertTrue(google_drive_api.clean_backup_retention("creds", 1))
                delete_execute.assert_not_called()
                self.assertEqual(self.google_integration_db.get_last_backup_clean_date(1), datetime.datetime.utcnow().strftime('%Y-%m-%d'))

        def test_clean_backup_no_files(self):
             with self.application.app.app_context():
                self.google_integration_db.update_last_backup_clean_date(1, datetime.datetime(year=2023, day=1, month=1).strftime('%Y-%m-%d'))
                get_folder = patch("Oauth.google_drive_api.get_folder").start()
                get_folder.return_value = {"id":1}
                get_files_from_folder = patch("Oauth.google_drive_api.get_files_from_folder").start()
                get_files_from_folder.return_value = []
                delete_execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
                delete_execute.return_value = True
                self.assertTrue(google_drive_api.clean_backup_retention("creds", 1))
                delete_execute.assert_not_called()
                self.assertEqual(self.google_integration_db.get_last_backup_clean_date(1), datetime.datetime.utcnow().strftime('%Y-%m-%d'))
        
        def test_clean_backup_bad_files(self):
             nb_backup = 30 
             with self.application.app.app_context():
                self.google_integration_db.update_last_backup_clean_date(1, datetime.datetime(year=2023, day=1, month=1).strftime('%Y-%m-%d'))
                get_folder = patch("Oauth.google_drive_api.get_folder").start()
                get_folder.return_value = {"id":1}
                get_files_from_folder = patch("Oauth.google_drive_api.get_files_from_folder").start()
                get_files_from_folder.return_value = [{"name" : "bad_file", "explicitlyTrashed": False, "id": day} for day in range(1, nb_backup)]
                delete_execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
                delete_execute.return_value = True
                self.assertFalse(google_drive_api.clean_backup_retention("creds", 1))
                delete_execute.assert_not_called()
                self.assertEqual(self.google_integration_db.get_last_backup_clean_date(1), datetime.datetime.utcnow().strftime('%Y-%m-%d'))

#####################
## delete_all_backups
#####################

        def test_delete_all_backups(self):
            get_service = patch("Oauth.google_drive_api.get_drive_service").start()
            get_service.return_value = self.drive
            get_folder = patch("Oauth.google_drive_api.get_folder").start()
            get_folder.return_value = {"id":1}
            get_files_from_folder = patch("Oauth.google_drive_api.get_files_from_folder").start()
            get_files_from_folder.return_value = [{"name" : "01-01-2023-00-00-00_backup", "explicitlyTrashed": False, "id": 1}, {"name" : "01-01-2023-00-00-00_backup", "explicitlyTrashed": False, "id": 2},{"name" : "01-01-2023-00-00-00_backup", "explicitlyTrashed": False, "id": 3}]
            delete_execute = patch("tests.unit.test_google_drive_api.TestGoogleDriveAPI.MockedDriveService.execute").start()
            delete_execute.return_value = True
            self.assertTrue(google_drive_api.delete_all_backups("creds"))
            delete_execute.assert_called()
    
        def test_delete_all_backups_no_folder(self):
            get_service = patch("Oauth.google_drive_api.get_drive_service").start()
            get_service.return_value = self.drive
            get_folder = patch("Oauth.google_drive_api.get_folder").start()
            get_folder.return_value = None
            self.assertTrue(google_drive_api.delete_all_backups("creds"))

        