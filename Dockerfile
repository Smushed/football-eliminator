FROM node:10

# Create and change to the server directory.
WORKDIR /server

# copy package.json into the container at /server
COPY package*.json /server/

# Install dependencies.
RUN npm install

# Copy the current directory contents into the container at /server
COPY . /server/

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Run the web service on container startup.
CMD [ "npm", "start" ]