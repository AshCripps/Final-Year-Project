FROM node:latest
MAINTAINER Ash Cripps <14062034>
EXPOSE 3000
RUN mkdir -p /monapp
WORKDIR /monapp
COPY . .
RUN npm install
ENTRYPOINT ["node","server.js"]
