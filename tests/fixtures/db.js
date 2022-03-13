const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../src/models/User");
const Task = require("../../src/models/Task");

//Testing User
const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: `Ori`,
  email: `Ori@example.com`,
  age: 31,
  password: `OriIsMalshin`,
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: `Ori`,
  email: `OriMalshin@example.com`,
  age: 31,
  password: `OriIsMalshin`,
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
  ],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "task 1",
  completed: true,
  owner: userOne._id,
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "task 2",
  completed: false,
  owner: userOne._id,
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "task 3",
  completed: true,
  owner: userTwo._id,
};

const setupDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userTwoId,
  taskOne,
  taskTwo,
  taskThree,
  userTwo,
  userOne,
  userOneId,
  setupDatabase,
};
