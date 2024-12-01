FROM node:latest

WORKDIR /root/nodeServer/app/bin

RUN apt-get update && \
    apt-get install -y jq iputils-ping vim zip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY bin .
COPY components ../components
COPY configuration ../configuration
#COPY node_modules ../node_modules
COPY package.json ../
COPY backendServer.js ../


RUN chmod 777 ./installDep.sh

RUN ./installDep.sh

EXPOSE 8082

# CMD [ "node", "backendServer.js" ]
CMD [ "bash" , "Run.sh"]