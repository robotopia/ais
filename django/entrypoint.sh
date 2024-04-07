#!/bin/bash
set -e

# This is only run on the first start-up of the container.
CONTAINER_FIRST_STARTUP="CONTAINER_FIRST_STARTUP"
if [ ! -e /$CONTAINER_FIRST_STARTUP ]; then
    touch /$CONTAINER_FIRST_STARTUP

    # Iniitalise the DB with schema
    python3 manage.py collectstatic
fi

if [ "$DJANGO_DEBUG" == "True" ]
then
    echo "Using Django's built-in 'runserver'..."
    python3 manage.py runserver 0.0.0.0:8000
else
    echo "Using UWSGI..."
    uwsgi --ini /django/ais.uwsgi.ini
fi

