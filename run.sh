#!/bin/bash

docker stop dimmao || true
docker rm dimmao || true
# docker image prune -af

docker build -t dimmao .

docker run -d \
  --name dimmao \
  -v $(pwd)/data.db:/app/data.db \
  --env-file .env \
  dimmao

docker logs -f dimmao