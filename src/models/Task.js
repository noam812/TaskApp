const mongoose = require("mongoose");

const TaskSchema = mongoose.Schema(
  {
    description: {
      type: String,
      maxlegnth: 150,
      minlength: 1,
      trim: true,
      required: true,
    },
    completed: { type: Boolean, default: false },
    subtasks: [
      {
        title: { type: String, maxlegnth: 150, minlength: 1, trim: true },
        completed: { type: Boolean },
      },
    ],
    //Preparing the owner for user/task relationship
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const task = mongoose.model(`tasks`, TaskSchema);
module.exports = task;
