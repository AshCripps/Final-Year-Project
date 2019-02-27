FROM ubuntu:18:04
MAINTAINER Ash Cripps <14062034>

RUN apt-get update
RUN apt-get upgrade -y

RUN mkdir -p /monapp
WORKDIR /monapp
COPY . .

RUN npm install

EXPOSE 3000

CMD node server.js
