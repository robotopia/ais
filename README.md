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

### Build docker container

The `docker build` command must be run from the `src` directory:
```
cd ../src
docker build -t <your username>/ais -f ../docker/Dockerfile .
```

### Run the container

```
docker run -p <port>:8080 -d smcsweeney/ais
```
