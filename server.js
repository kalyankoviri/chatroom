const express = require("express");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
  console.log("A user connected");

  socket.on("newuser", function (username) {
    socket.username = username;
    socket.broadcast.emit("update", `${username} joined the conversation`);
  });

  socket.on("chat", function (message) {
    socket.broadcast.emit("chat", message);
  });

  socket.on("exituser", function (username) {
    socket.broadcast.emit("update", `${username} left the conversation`);
  });

  socket.on("disconnect", function () {
    if (socket.username) {
      socket.broadcast.emit("update", `${socket.username} disconnected`);
    }
  });
});

server.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
