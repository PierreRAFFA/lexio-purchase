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
docker run --name wordz-purchase -p 3020:3010 --link wordz-mongo:mongo -d pierreraffa/wordz-purchase:latest  
  
###Connect to the containers:  
docker exec -it wordz-purchase /bin/bash  

###Connect to the logs  
docker logs {container} -f