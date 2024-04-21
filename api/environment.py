import os
import logging

port = int(os.environ.get('PORT')) if os.environ.get('PORT') != None else None
db_uri = os.environ.get('DATABASE_URI')
environment = os.environ.get('ENVIRONMENT')
jwt_secret = os.environ.get('JWT_SECRET')
private_key_path = os.environ.get('PRIVATE_KEY_PATH')
public_key_path = os.environ.get('PUBLIC_KEY_PATH')
oauth_client_secret_file = os.environ.get('OAUTH_CLIENT_SECRET_FILE')
flask_secret_key = os.environ.get('FLASK_SECRET_KEY')
sever_side_encryption_key = os.environ.get('SEVER_SIDE_ENCRYPTION_KEY')
are_all_tables_created = False
admin_can_delete_users = os.environ.get('ADMIN_CAN_DELETE_USERS') == "true"
email_sender_address = os.environ.get('EMAIL_SENDER_ADDRESS')
email_sender_password = os.environ.get('EMAIL_SENDER_PASSWORD')
email_smtp_server = os.environ.get('EMAIL_SMTP_SERVER')
email_smtp_port = os.environ.get('EMAIL_SMTP_PORT')
email_smtp_username = os.environ.get('EMAIL_SMTP_USERNAME')
require_email_validation = os.environ.get('REQUIRE_EMAIL_VALIDATION') == "true"
sentry_dsn = os.environ.get('SENTRY_DSN')
login_attempts_limit_per_ip = int(os.environ.get('LOGIN_ATTEMPTS_LIMIT_PER_IP')) if os.environ.get('LOGIN_ATTEMPTS_LIMIT_PER_IP') != None else 10
send_email_attempts_limit_per_user = int(os.environ.get('SEND_EMAIL_ATTEMPTS_LIMIT_PER_USER')) if os.environ.get('SEND_EMAIL_ATTEMPTS_LIMIT_PER_USER') != None else 5
login_ban_time = int(os.environ.get('LOGIN_BAN_TIME')) if os.environ.get('LOGIN_BAN_TIME') != None else 15
email_ban_time = int(os.environ.get('EMAIL_BAN_TIME')) if os.environ.get('EMAIL_BAN_TIME') != None else 60
migration_required = os.environ.get('MIGRATION_REQUIRED') == "true"


if environment == "local":
    logging.basicConfig(
        format='%(asctime)s %(levelname)-8s %(message)s',
        level=logging.DEBUG,
        datefmt='%d-%m-%Y %H:%M:%S')
    logging.debug("Environment set to development")
    frontend_domain = 'zero-totp.local'
    frontend_URI = ['http://localhost:4200']
    callback_URI = 'http://localhost:8080/google-drive/oauth/callback'
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
elif environment == "development":
    logging.basicConfig(
        format='%(asctime)s %(levelname)-8s %(message)s',
        level=logging.INFO,
        datefmt='%d-%m-%Y %H:%M:%S')
    logging.info("Environment set to development")
    frontend_domain = 'dev.zero-totp.com'
    frontend_URI = ['https://dev.zero-totp.com']
    callback_URI = "https://dev.zero-totp.com/google-drive/oauth/callback"
else:
    environment = "production"
    logging.basicConfig(
        filename="/var/log/api/api.log",
        filemode='a',
        format='%(asctime)s %(levelname)-8s %(message)s',
        level=logging.INFO,
        datefmt='%d-%m-%Y %H:%M:%S')
    frontend_domain="zero-totp.com"
    frontend_URI = ["https://zero-totp.com", "https://ca.zero-totp.com", "https://eu.zero-totp.com"]
    callback_URI = "https://api.zero-totp.com/google-drive/oauth/callback"



if port == None:
    port = 8080
    logging.warning("PORT environment variable not set. Using default value: 8080")

if admin_can_delete_users != True:
    logging.info("ADMIN_CAN_DELETE_USERS environment variable not set. Using default value: false")
    admin_can_delete_users = False
else:
    logging.warning("ADMIN_CAN_DELETE_USERS environment variable set to true. This should be a TEMPORARY option ONLY.  Please set it to false if you are not sure what you are doing. DISABLE THIS OPTION AS SOON AS NOT NEEDED ANYMORE.")


if db_uri == None:
    logging.error("DATABASE_URI environment variable not set. Please set it to a valid database URI. Aborting...")
    raise Exception("DATABASE_URI environment variable not set. Please set it to a valid database URI.")





if jwt_secret == None:
    logging.error("JWT_SECRET environment variable not set. Please set it to a valid secret key. Aborting...")
    raise Exception("JWT_SECRET environment variable not set. Please set it to a valid secret key.")


if private_key_path == None or public_key_path == None:
    logging.error("PRIVATE_KEY_PATH or PUBLIC_KEY_PATH environment variable not set. Please set it to a valid key path. Aborting...")
    raise Exception("PRIVATE_KEY_PATH or PUBLIC_KEY_PATH environment variable not set. Please set it to a valid key path.")




if oauth_client_secret_file == None:
    logging.error("OAUTH_CLIENT_SECRET_FILE environment variable not set. Please set it to a valid path to the client_secret.json file. Aborting...")
    raise Exception("OAUTH_CLIENT_SECRET_FILE environment variable not set. Please set it to a valid path to the client_secret.json file.")

if flask_secret_key == None:
    logging.error("FLASK_SECRET_KEY environment variable not set. Please set it to a valid secret key. Aborting...")
    raise Exception("FLASK_SECRET_KEY environment variable not set. Please set it to a valid secret key.")


if sever_side_encryption_key == None:
    logging.error("SEVER_SIDE_ENCRYPTION_KEY environment variable not set. Please set it to a valid secret key. Aborting...")
    raise Exception("SEVER_SIDE_ENCRYPTION_KEY environment variable not set. Please set it to a valid secret key.")


if email_sender_address == None or email_sender_password == None or email_smtp_server == None or email_smtp_port == None or email_smtp_username == None:
    logging.error("EMAIL_SENDER_ADDRESS, EMAIL_SENDER_PASSWORD, EMAIL_SMTP_SERVER, EMAIL_SMTP_USERNAME or EMAIL_SMTP_PORT environment variable not set. Email verification will not work.")

if require_email_validation == False:
    logging.info("REQUIRE_EMAIL_VALIDATION is disabled. Users will not be asked to verify their email address. You can enable this option by setting the REQUIRE_EMAIL_VALIDATION environment variable to true at any moment.")