const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const TodoModel = require("./model/todo");
const http = require("http");
const socketIo = require("socket.io");

const MongoURL = "mongodb://127.0.0.1:27017/todolist";
mongoose.connect(MongoURL)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

const app = express();
const server = http.createServer(app);
const io = socketIo(server);  // WebSocket server

app.use(cors());
app.use(express.json());

// Fetch all tasks
app.get("/show", (req, res) => {
  TodoModel.find()
    .then(result => res.json(result))
    .catch(err => console.log(err));
});

// Add a new task
app.post("/add", (req, res) => {
  const { task } = req.body;
  TodoModel.create({ task })
    .then(result => {
      io.emit("taskAdded", result);  // Emit event to all clients
      res.json(result);
    })
    .catch(err => res.json(err));
});

// Lock a task
app.put("/lock/:id", (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // The ID of the user who wants to lock the task

  TodoModel.findById(id)
    .then(todo => {
      if (todo.lockedBy && todo.lockedBy !== userId) {
        return res.status(400).json({ message: "Task is already locked by another user." });
      }

      // Lock the task
      todo.lockedBy = userId;
      todo.save()
        .then(updatedTodo => {
          io.emit("taskLocked", updatedTodo);  // Emit event to all clients
          res.json(updatedTodo);
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

// Unlock a task
app.put("/unlock/:id", (req, res) => {
  const { id } = req.params;

  TodoModel.findById(id)
    .then(todo => {
      todo.lockedBy = null;  // Unlock the task
      todo.save()
        .then(updatedTodo => {
          io.emit("taskUnlocked", updatedTodo);  // Emit event to all clients
          res.json(updatedTodo);
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

// Mark a task as done
app.put("/update/:id", (req, res) => {
  const { id } = req.params;

  TodoModel.findById(id)
    .then(todo => {
      if (todo.lockedBy && todo.lockedBy !== req.body.userId) { // Check if the task is locked
        return res.status(400).json({ message: "Task is locked by another user." });
      }

      todo.done = true;
      todo.save()
        .then(updatedTodo => {
          io.emit("taskUpdated", updatedTodo);  // Emit event to all clients
          res.json(updatedTodo);
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

// Edit a task
app.put("/edit/:id", (req, res) => {
  const { id } = req.params;
  const { task, userId } = req.body;

  TodoModel.findById(id)
    .then(todo => {
      if (todo.lockedBy && todo.lockedBy !== userId) { // Prevent edit if the task is locked by another user
        return res.status(400).json({ message: "Task is locked by another user." });
      }

      // Save current task as a version before updating
      todo.versions.push({
        task: todo.task,
        done: todo.done,
        date: Date.now()
      });

      todo.task = task;  // Update the task
      todo.save()
        .then(updatedTodo => {
          io.emit("taskUpdated", updatedTodo);  // Emit event to all clients
          res.json(updatedTodo);
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

// View task versions
app.get("/versions/:id", (req, res) => {
  const { id } = req.params;
  TodoModel.findById(id)
    .then(todo => res.json(todo.versions))
    .catch(err => res.json(err));
});

// Revert to a previous task version
app.put("/revert/:id/:versionId", (req, res) => {
  const { id, versionId } = req.params;

  TodoModel.findById(id)
    .then(todo => {
      const version = todo.versions[versionId];
      todo.task = version.task;
      todo.done = version.done;

      todo.save()
        .then(updatedTodo => {
          io.emit("taskUpdated", updatedTodo);  // Emit event to all clients
          res.json(updatedTodo);
        })
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

app.delete("/delete/:id", (req, res) => {
  const { id } = req.params;
  TodoModel.findByIdAndDelete(id)
    .then(result => {
      if (!result) {
        return res.status(404).json({ message: "Task not found" });
      }
      io.emit("taskDeleted", id);  // Emit event to all clients
      res.json(result);
    })
    .catch(err => res.status(500).json(err));
});

// WebSocket connection to handle real-time sync
io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for task edit events
  socket.on("taskEdit", (task) => {
    io.emit("taskUpdated", task);  // Broadcast updated task to all users
  });

  // Listen for task lock events
  socket.on("taskLock", (task) => {
    io.emit("taskLocked", task);  // Broadcast task lock to all users
  });

  // Listen for task unlock events
  socket.on("taskUnlock", (task) => {
    io.emit("taskUnlocked", task);  // Broadcast task unlock to all users
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});
