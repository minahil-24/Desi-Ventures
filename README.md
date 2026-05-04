Desi Venture (Project Description – improved & longer)

Desi Venture is a full-stack web application designed to simplify home food ordering by connecting users with local food providers. The platform allows users to browse a variety of menus, place orders for home delivery or pickup, and track their orders in real time. It includes secure user authentication to ensure personalized user experiences, order history management, and smooth interaction between customers and restaurants. The system is designed to provide a fast, reliable, and user-friendly food ordering experience with efficient backend data handling and secure database integration.

⚙️ Step 1: Create .env file

Inside your project root, create a file named:

.env

Add this inside it:

MONGO_URI=mongodb://localhost:27017/login-system
PORT=3000
📦 Step 2: Install Node Modules

Run this in your project terminal:

npm install

This will install all dependencies from package.json.

🚀 Step 3: Run the project

Start your server using:

node index.js

OR if you use nodemon:

npx nodemon index.js
🗑️ Step 4: Node modules (important)

If you ever need to remove and reinstall:

Remove:
rmdir /s /q node_modules
del package-lock.json
Reinstall:
npm install
