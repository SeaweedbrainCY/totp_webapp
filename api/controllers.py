from flask import request
import connexion
import json
from database.dbFunctions import User as UserDB
from Crypto.hash_func import Bcrypt
import logging
import environment as env
import random
import string
from flask_cors import CORS
import Crypto.jwt_func as jwt_auth


if env.environment == "development":
    logging.getLogger().setLevel(logging.INFO)


# POST /signup
def signup():
    dataJSON = json.dumps(request.get_json())
    try:
        data = json.loads(dataJSON)
        data["username"] = data["username"].strip()
        data["password"] = data["password"].strip()
        data["email"] = data["email"].strip()
    except Exception as e:
        logging.info(e)
        return {"message": "Invalid request"}, 400
    
    if not data["username"] or not data["password"] or not data["email"]:
        return {"message": "Missing parameters"}, 400
    
    userDB = UserDB()
    user = userDB.getByEmail(data["email"])
    if user:
        return {"message": "User already exists"}, 409
    
    bcrypt = Bcrypt(data["password"])
    try : 
        hashedpw = bcrypt.hashpw()
    except ValueError as e:
        logging.debug(e)
        return {"message": "Password is too long"}, 400
    except :
        logging.warning("Uknown error occured while hashing password")
        return {"message": "Unknown error while hashing your password"}, 500
    
    user = userDB.create(data["username"], data["email"], hashedpw)
    if user :
        return {"message": "User created"}, 201
    else :
        return {"message": "Unknown error while creating user"}, 500



# POST /login
def login():
    dataJSON = json.dumps(request.get_json())
    try:
        data = json.loads(dataJSON)
        data["password"] = data["password"].strip()
        data["email"] = data["email"].strip()
    except Exception as e:
        logging.info(e)
        return {"message": "Invalid request"}, 400
    
    if not data["password"] or not data["email"]:
        return {"message": "Missing parameters"}, 400
    userDB = UserDB()
    user = userDB.getByEmail(data["email"])
    logging.info(user)
    bcrypt = Bcrypt(data["password"])
    if not user:
        #we hash for security reasons
        fakePassword = ''.join(random.choices(string.ascii_letters, k=random.randint(10, 20)))
        bcrypt.checkpw(fakePassword)
        return {"message": "Invalid credentials"}, 403
    checked = bcrypt.checkpw(user.password)
    if not checked:
        return {"message": "Invalid credentials"}, 403
    jwt_token = jwt_auth.generate_jwt(user.id)
    return {"message": "Logged in", "jwt": jwt_token}, 200
    


#GET /vault
def getVault():
    try:
        user_id = connexion.context.get("user")
        logging.info(user_id)
    except Exception as e:
        logging.info(e)
        return {"message": "Invalid request"}, 400
    
