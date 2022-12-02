const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "/public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (client) => {
  console.log("New websocket connection");
  client.on("messageFromClient", (msg) => {
    io.emit("messageFromServer", msg);
  });
  client.on("disconnect", () => {
    console.log("New websocket disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
