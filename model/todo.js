const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  task: { type: String, required: true },
  done: { type: Boolean, default: false },
  versions: [
    {
      task: String,
      done: Boolean,
      date: { type: Date, default: Date.now },
    },
  ],
  lockedBy: { type: String, default: "" }, // Field to track who locked the task
});

const TodoModel = mongoose.model("Todo", todoSchema);

module.exports = TodoModel;
