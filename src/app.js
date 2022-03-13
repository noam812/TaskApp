const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const taskRouter = require("./routers/tasks");
const userRouter = require(`./routers/user`);

  const app = express();
  app.use(cors());

  app.use(express.json());

  mongoose.connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  app.use(`/users`, userRouter);
  app.use(`/tasks`, taskRouter);


module.exports = app
