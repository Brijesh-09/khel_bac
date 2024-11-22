# Step 1: Use the official Node.js LTS image as the base
FROM node:18

# Step 2: Set the working directory in the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json to the container
COPY package*.json ./

# Step 4: Install dependencies inside the container
RUN npm install

# Step 5: Copy the rest of the application code to the container
COPY . .

# Step 6: Ensure the app.js file has execution permissions
RUN chmod +x app.js

# Step 7: Expose the port the app runs on
EXPOSE 3000

# Step 8: Define the command to start the app
CMD ["node", "app.js"]
