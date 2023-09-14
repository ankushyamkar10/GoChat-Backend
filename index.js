const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 4000;
const http = require("http");
const server = http.createServer(app);
const dotenv = require("dotenv").config();
const colors = require("colors");
const path = require("path");
const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");

connectDB();

app.use(cors());
app.use(
  express.urlencoded({ extended: true, limit: "50mb", parameterLimit: 50000 })
);
app.use(express.json({ limit: "50mb" }));

const { Server } = require("socket.io");
const { log } = require("console");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  },
});

/* all other stuff */

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/message", require("./routes/messageRoutes"));
app.use("/api/groups", require("./routes/groupRoutes"));

app.all("*", (req, res) => {
  res.status(404);
  throw new Error("Route Not Found");
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) =>
    res.sendFile(
      path.resolve(__dirname, "../", "client", "build", "index.html")
    )
  );
} else {
  app.get("/", (req, res) => res.send("Please set to production"));
}

// global.onlineUsers = new Map();
global.currGroup = {};
global.currentUsers = {};

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    currentUsers[userId] = socket.id;
  });

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    // log("joined groupId", groupId);
  });

  socket.on("sendMsg", async ({ text, recieverId, sender }) => {
    const recieverSocketId = currentUsers[recieverId];
    // log(sender);
    if (recieverSocketId) {
      io.to(recieverSocketId).emit("recieveMsg", {
        message: { text },
        sender,
      });
      // log("sent to ", recieverSocketId);
    } else
      io.in(recieverId).emit("recieveMsg", {
        message: { text },
        sender,
      });
    log(recieverId);
  });
});

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
