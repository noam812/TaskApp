const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const TaskModel = require("../models/Task");
/**
 * @createTask - takes auth user id and creates new task with authId as owner of task
 */


router.post("/", auth, async (req, res) => {
  const createTask = new TaskModel({ ...req.body, owner: req.user._id });
  try {
    const savedTask = await createTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ error });
    console.error(error);
  }
});
 
// Get tasks for user using query
router.get("/", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    console.log(req.user);
    /**
     * @populate - takes the reffered tasks from auth user
     * more options are given like limit and skip
     */
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit) || null,
        skip: parseInt(req.query.skip) || null,
        sort,
      },
    });
    res.status(200).send(req.user.tasks);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.get(`/:id`, auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await TaskModel.findOne({ _id, owner: req.user._id });
    if (!task) {
      res.status(404).send();
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [`description`, `completed`];
  const isValidUpdateOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdateOperation) {
    return res.status(404).send("Error : Update Fields are invalid");
  }

  try {
    const task = await TaskModel.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send("Could not find task to update");
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error);
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedTask = await TaskModel.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!deletedTask) {
      return res.status(404).send();
    }

    res.json(deletedTask);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
