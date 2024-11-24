const app = require("../server.js"); // Import the app from server.js
const { createServer } = require("http");

// Create a server and pass the Express app
const server = createServer(app);

module.exports = (req, res) => {
  server.emit("request", req, res);
};
