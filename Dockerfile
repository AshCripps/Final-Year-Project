FROM node:latest
MAINTAINER Ash Cripps <14062034>
EXPOSE 3000
COPY monapp /
WORKDIR monapp
RUN npm install
ENTRYPOINT ["node","server.js"]
