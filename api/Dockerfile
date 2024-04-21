FROM python:3.11-slim

COPY . /api
WORKDIR /api

RUN apt-get clean \
    && apt-get -y update

RUN apt-get -y install python3-pip python3-dev build-essential libssl-dev libffi-dev python3-setuptools gcc default-libmysqlclient-dev pkg-config
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
EXPOSE 8080

RUN chmod +x ./start.sh
RUN chmod +x ./flask_migrate_wrapper.sh
RUN mkdir /var/log/api/ && touch /var/log/api/gunicorn_error.log && touch /var/log/api/api.log && touch /var/log/api/gunicorn_access.log
RUN chown -R 1001:1001 /var/log/api/
USER 1001:1001
CMD ["./start.sh"]
