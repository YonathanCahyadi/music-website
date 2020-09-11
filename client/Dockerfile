# set node ver erbium as the base images
FROM node:erbium

# set the working dir to /client
WORKDIR /client

# copy the pakage.json file
COPY package*.json /client/

# install dependency
RUN npm install

# copy the current dir to the container /client
COPY . /client/

# Make port 3000 available for world outside this container
EXPOSE 3000

# run the app when the container launch
CMD ["npm", "start"]