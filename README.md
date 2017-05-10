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
$ docker build -t pierreraffa/wordz-purchase:latest .  
$ docker push pierreraffa/wordz-purchase:latest  
$ docker pull pierreraffa/wordz-purchase:latest  
 ``` 
#### Create containers  
```sh
$ docker run --name wordz-purchase-mongo -p 27018:27017 -v /opt/wordz-purchase-mongo/db:/data/db -d mongo --auth  
$ docker exec -it wordz-purchase-mongo mongo admin  
  > db.createUser({ user: "admin", pwd: "password", roles:["root"]})  
  > db.auth("admin","password")  
  > use wordz-purchase  
  > db.createUser({ user: "api", pwd: "password", roles: ["readWrite"] })  
$ docker run -it --rm --link wordz-purchase-mongo:mongo mongo mongo -u api -p password --authenticationDatabase wordz-purchase wordz-purchase-mongo/wordz-purchase  

$ docker run --name wordz-purchase -p 3020:3020 --link wordz-purchase-mongo:mongo -d pierreraffa/wordz-purchase:latest  
``` 

#### Connect to the containers:  
```sh
docker exec -it wordz-purchase /bin/bash  
```
#### Connect to the logs  
```sh
docker logs wordz-purchase -f  
```