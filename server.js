const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const allowedUsers = ["KALYAN", "ASHOK", "PAVAN", "KIRAN"];
const PASSWORD = "PMKBOYS";

const onlineUsers = new Map();

app.use(express.static(__dirname + "/public"));

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("login", ({ username, password, language }) => {
    username = username.toUpperCase();

    if (!allowedUsers.includes(username)) {
      socket.emit("loginFailed", "Username not allowed.");
      return;
    }
    if (password !== PASSWORD) {
      socket.emit("loginFailed", "Incorrect password.");
      return;
    }
    if ([...onlineUsers.keys()].includes(username)) {
      socket.emit("loginFailed", "User already logged in.");
      return;
    }

    onlineUsers.set(username, socket.id);
    socket.username = username;

    console.log(`User ${username} logged in with language: ${language}`);
    socket.emit("loginSuccess", username);
    io.emit("update", `${username} has joined the chat.`);
    io.emit("userList", [...onlineUsers.keys()]);
  });

  socket.on("chat", (message) => {
    io.emit("chat", message);
  });

  socket.on("exituser", (username) => {
    onlineUsers.delete(username);
    io.emit("update", `${username} left the chat.`);
    io.emit("userList", [...onlineUsers.keys()]);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      onlineUsers.delete(socket.username);
      io.emit("update", `${socket.username} disconnected.`);
      io.emit("userList", [...onlineUsers.keys()]);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
