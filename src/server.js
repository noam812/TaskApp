require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const taskRouter = require("./routers/tasks");
const userRouter = require(`./routers/user`);

async function main() {
  const app = express();
  const PORT = process.env.PORT || 3001;
  app.use(cors());

  app.use(express.json());

  mongoose.connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  app.use(`/users`, userRouter);
  app.use(`/tasks`, taskRouter);

  app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
  });
}

main();
