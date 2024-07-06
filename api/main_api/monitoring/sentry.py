import sentry_sdk
from main_api.environment import logging, conf


def sentry_configuration():
    if conf.features.sentry:
        
        logging.info("🔧  Sentry configured")
        sentry_sdk.init(
            dsn=conf.features.sentry.dsn,
            # Set traces_sample_rate to 1.0 to capture 100%
            # of transactions for performance monitoring.
            traces_sample_rate=1.0,
            # Set profiles_sample_rate to 1.0 to profile 100%
            # of sampled transactions.
            # We recommend adjusting this value in production.
            profiles_sample_rate=1.0,

        )
    
