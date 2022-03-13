const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/Task");
const {
  setupDatabase,
  userOne,
  userOneId,
  userTwo,
  taskOne,
} = require("./fixtures/db");

//beforeEach will execute a function bofore each test case. AfterEach work the opposite.
beforeEach(setupDatabase);

test("Should create task for user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "From my test",
    })
    .expect(201);

  //Assertion
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test("Should get tasks for authenticated user", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body.length).toEqual(2);
});

test("Should NOT get tasks for  un-authenticated user", async () => {
  const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);
  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
