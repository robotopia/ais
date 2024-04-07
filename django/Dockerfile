FROM python:3.11

# Copy webapp into container
RUN mkdir /django
WORKDIR /django
COPY . /django/

# Install necessary packages
RUN apt-get update
RUN apt-get install build-essential mariadb python3.11-dev python3-pip gosu locales vim -yqq

# Install Python requirements
RUN pip3 install uwsgi
RUN pip3 install -r requirements.txt

# Start the container with entrypoint script
ENTRYPOINT ["/django/entrypoint.sh"]
