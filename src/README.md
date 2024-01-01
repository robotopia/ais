# Automatic Invoicing System (AIS)
A small Nodejs/MariaDB app for managing personal finances and invoicing.

## Installing the server

```
cd src
npm i
```

## Running the server

```
cd src
nodemon index.js
```

## Docker container

### Create .env file

Create a `.env` file in the `src` folder:
```
DBNAME=ppc_invoices
DBHOST=localhost
DBPORT=3306
DBUSER=...
DBPASS=...
```
Fill in the appropriate username and password for the database filled in the appropriate places.

### Build docker container

```
docker build -t ais-app .
```

### Run the container

```
docker run -p <port>:3000 -d ais-app
```
