# Wordz Purchase

Service used by wordz-api 

##Technical Overview
Loopback  
NodeJS  
MongoDB  
Docker

##Docker commands

###Build and push  
docker build -t pierreraffa/wordz-purchase:latest .  
docker push pierreraffa/wordz-purchase:latest  
docker pull pierreraffa/wordz-purchase:latest  
  
###Create containers
docker run --name wordz-purchase-mongo -p 27018:27017 -v /opt/wordz-purchase-mongo/db:/data/db -d mongo --auth  
docker exec -it wordz-purchase-mongo mongo admin  
  db.createUser({ user: "admin", pwd: "password", roles:["root"]})
  db.auth("admin","password");
  use wordz-purchase
  db.createUser({ user: "api", pwd: "password", roles: ["readWrite"] })
docker run -it --rm --link wordz-purchase-mongo:mongo mongo mongo -u api -p password --authenticationDatabase wordz-purchase wordz-purchase-mongo/wordz-purchase

docker run --name wordz-purchase -p 3020:3020 --link wordz-purchase-mongo:mongo -d pierreraffa/wordz-purchase:latest  
  
###Connect to the containers:  
docker exec -it wordz-purchase /bin/bash  

###Connect to the logs  
docker logs {container} -f