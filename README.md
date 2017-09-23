# Wordz Purchase

Wordz Purchase is a microservice dedicated to the purchase and products for AppStore and PlayStore.

## Technical Overview
- Loopback  
- NodeJS  
- MongoDB  
- Docker

## Docker Commands

#### Build and push to DockerHub

```sh
$ docker build -t pierreraffa/lexio-purchase:latest .  
$ docker push pierreraffa/lexio-purchase:latest  
$ docker pull pierreraffa/lexio-purchase:latest  
 ``` 
#### Create containers  
```sh
$ docker run --name lexio-purchase-mongo -p 27018:27017 -v /opt/lexio-purchase-mongo/db:/data/db -d mongo --auth  
$ docker exec -it lexio-purchase-mongo mongo admin  
  > db.createUser({ user: "admin", pwd: "password", roles:["root"]})  
  > db.auth("admin","password")  
  > use lexio-purchase  
  > db.createUser({ user: "api", pwd: "password", roles: ["readWrite"] })  
$ docker run --name lexio-purchase -p 3020:3020 --link lexio-purchase-mongo:mongo -d pierreraffa/lexio-purchase:latest  
``` 
#### Connect to the containers:  
```sh
$ docker exec -it lexio-purchase /bin/bash  
$ docker run -it --rm --link lexio-purchase-mongo:mongo mongo mongo -u api -p password --authenticationDatabase lexio-purchase lexio-purchase-mongo/lexio-purchase
```
#### Connect to the logs  
```sh
$ docker logs lexio-purchase -f  
```