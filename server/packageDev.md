
  "scripts": {
    "start": "concurrently \"nodemon --ignore client/\" \"npm run client\"",
    "client": "cd ../client && npm run start",
    "install": "cd ../client && npm install",
    "build": "cd ../client && npm run build"
  },
