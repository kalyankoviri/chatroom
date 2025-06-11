(() => {
  const app = document.querySelector(".app");
  const socket = io();
  let uname;

  // Toggle menu dropdown (only exists on chat screen)
  const menuBtn = document.querySelector(".menu-button");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      document.querySelector(".menu-dropdown").classList.toggle("active");
    });
  }

  // Toggle dark mode (works on entire body including join screen)
  const toggleDarkBtn = document.getElementById("toggle-dark");
  if (toggleDarkBtn) {
    toggleDarkBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      document.querySelector(".menu-dropdown").classList.remove("active");
    });
  }

  // Show/Hide password toggle
  document.getElementById("toggle-password").addEventListener("click", () => {
    const passInput = document.getElementById("password");
    if (passInput.type === "password") {
      passInput.type = "text";
      document.getElementById("toggle-password").textContent = "Hide";
    } else {
      passInput.type = "password";
      document.getElementById("toggle-password").textContent = "Show";
    }
  });

  // Join chat
  app.querySelector("#join-user").addEventListener("click", () => {
    const username = app.querySelector("#username").value.trim().toUpperCase();
    const password = app.querySelector("#password").value.trim();
    const language = app.querySelector("#language-select").value;

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    socket.emit("login", { username, password, language });
  });

  // Listen for login response
  socket.on("loginSuccess", (name) => {
    uname = name || app.querySelector("#username").value.trim().toUpperCase();
    app.querySelector(".join-screen").classList.remove("active");
    app.querySelector(".chat-screen").classList.add("active");
    app.querySelector("#message-input").focus();
  });

  socket.on("loginFailed", (msg) => {
    alert(msg);
  });

  // Send message
  app.querySelector("#send-message").addEventListener("click", sendMessage);
  app.querySelector("#message-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  function sendMessage() {
    const input = app.querySelector("#message-input");
    const message = input.value.trim();
    if (!message) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    renderMessage("my", { username: "You", text: message, time });
    socket.emit("chat", { username: uname, text: message, time });
    input.value = "";
  }

  // Exit chat
  app.querySelector("#exit-chat").addEventListener("click", () => {
    if (confirm("Are you sure you want to logout?")) {
      socket.emit("exituser", uname);
      window.location.reload();
    }
  });

  // Receive updates and messages
  socket.on("update", renderUpdate);
  socket.on("chat", (message) => {
    if (message.username !== uname) {
      renderMessage("other", message);
    }
  });

  socket.on("userList", (userList) => {
    const userUl = document.getElementById("users");
    userUl.innerHTML = "";
    userList.forEach((user) => {
      const li = document.createElement("li");
      li.textContent = user;
      li.classList.add("online");
      userUl.appendChild(li);
    });
  });

  function renderMessage(type, message) {
    const msgBox = document.querySelector(".messages");
    const el = document.createElement("div");
    el.classList.add("message");
    if (type === "my") {
      el.classList.add("my");
    } else {
      el.classList.add("other-message");
    }
    el.innerHTML = `
      <div>
        <div class="name">${message.username} <span class="time">${message.time || ""}</span></div>
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
