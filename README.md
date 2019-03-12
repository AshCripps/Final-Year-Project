# Final-Year-Project

run npm install in installation directory

Docker image available here: https://cloud.docker.com/repository/docker/ashcripps/final-year-project/tags

`docker run --net=host -d ashcripps/final-year-project:monapp`

This is will run the app and allow it to connect to the mongodb on the localhost and run the container in the background

To run in kubernetes:

`kubectl create -f monapp.YAML`

This will create a kubernetes deployment and pod which will attach to port 3000
