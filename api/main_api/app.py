import connexion
from flask_cors import CORS
from main_api.environment import conf
import uvicorn
from asgiref.wsgi import WsgiToAsgi
from starlette.middleware.cors import CORSMiddleware
from connexion.middleware import MiddlewarePosition
from main_api.environment import logging
import contextlib
from flask_apscheduler import APScheduler
from main_api.monitoring.sentry import sentry_configuration
from flask_migrate import Migrate
from datetime import datetime
from flask import request, redirect, make_response
from db_models.db import db


def create_app():
    app_instance = connexion.FlaskApp(__name__, specification_dir="./openAPI/")
    app_instance.add_middleware(
    CORSMiddleware,
    position=MiddlewarePosition.BEFORE_ROUTING,
    allow_origins=conf.environment.frontend_URI,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
    app_instance.add_api("swagger.yml")

    app = app_instance.app

    app.config["SQLALCHEMY_DATABASE_URI"] = conf.database.database_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["PROPAGATE_EXCEPTIONS"] = True
    app.secret_key = conf.api.flask_secret_key
    

    
    db.init_app(app)
    sentry_configuration() #optional
    

    return app_instance, app
app, flask = create_app()
migrate = Migrate(flask, db)
scheduler = APScheduler()
scheduler.init_app(flask)
scheduler.start()


@scheduler.task('interval', id='clean_email_verification_token_from_db', hours=12, misfire_grace_time=900)
def clean_email_verification_token_from_db():
    with flask.app_context():
        logging.info("🧹  Cleaning email verification tokens from database")
        from db_models.model import EmailVerificationToken
        
        tokens = db.session.query(EmailVerificationToken).all()
        for token in tokens:
            if float(token.expiration) < datetime.now().timestamp():
                db.session.delete(token)
                db.session.commit()
                logging.info(f"❌  Deleted token for user {token.user_id} at {datetime.now()}")

@scheduler.task('interval', id='clean_rate_limiting_from_db', hours=2, misfire_grace_time=900)
def clean_rate_limiting_from_db():
    with flask.app_context():
        logging.info("🧹  Cleaning rate limits from database")
        from main_api.db_repo.rate_limiting_repo import RateLimitingRepo
        RateLimitingRepo().flush_outdated_limit()
        logging.info(f"✅  Rate limits cleaned at {datetime.utcnow()}")


@flask.before_request
def before_request():
    if not conf.database.are_all_tables_created:
        with app.app.app_context():
            db.create_all()
            db.session.commit()
            logging.info("✅  Tables created")
            logging.info(db.metadata.tables.keys())
            conf.database.are_all_tables_created = True

@flask.errorhandler(404)
def not_found(error):
    logging.warning(f"❌  404 error at {datetime.now()} {request.remote_addr} {request.url}")
    return make_response(redirect(conf.environment.frontend_URI[0] + "/404",  code=302))
            




if __name__ == "__main__":
   uvicorn.run("app:app", host="0.0.0.0", port=conf.api.port, reload=True)
   


