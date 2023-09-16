# Docker container

## Build docker container

The `docker build` command must be run from the `src` directory:
```
cd ../src
docker build -t <your username>/ais -f ../docker/Dockerfile .
```

## Run the container

```
docker run -p <port>:8080 -d smcsweeney/ais
```