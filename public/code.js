(function () {
  const app = document.querySelector(".app");
  const socket = io();
  let uname;

  app.querySelector("#join-user").addEventListener("click", function () {
    const username = app.querySelector("#username").value.trim();
    if (username.length === 0) return;

    socket.emit("newuser", username);
    uname = username;

    app.querySelector(".join-screen").classList.remove("active");
    app.querySelector(".chat-screen").classList.add("active");
  });

  app.querySelector("#send-message").addEventListener("click", function () {
    const message = app.querySelector("#message-input").value.trim();
    if (message.length === 0) return;

    renderMessage("my", {
      username: "You",
      text: message,
    });

    socket.emit("chat", {
      username: uname,
      text: message,
    });

    app.querySelector("#message-input").value = "";
  });

  app.querySelector("#exit-chat").addEventListener("click", function () {
    socket.emit("exituser", uname);
    window.location.href = window.location.href;
  });

  socket.on("update", function (updateMsg) {
    renderUpdate(updateMsg);
  });

  socket.on("chat", function (message) {
    renderMessage("other", message);
  });

  function renderMessage(type, message) {
    const msgBox = document.querySelector(".messages");
    const el = document.createElement("div");
    el.classList.add("message", type === "my" ? "my" : "other-message");

    el.innerHTML = `
      <div>
        <div class="name">${message.username}</div>
        <div class="text">${message.text}</div>
      </div>
    `;

    msgBox.appendChild(el);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  function renderUpdate(msg) {
    const msgBox = document.querySelector(".messages");
    const el = document.createElement("div");
    el.classList.add("update");
    el.innerText = msg;
    msgBox.appendChild(el);
    msgBox.scrollTop = msgBox.scrollHeight;
  }
})();
