const request = require("supertest");
const app = require("../src/app");
const { setupDatabase, userOne, userOneId } = require("./fixtures/db");
const User = require("../src/models/User");

//beforeEach will execute a function bofore each test case. AfterEach work the opposite.
beforeEach(setupDatabase);

test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Noamy",
      email: "noam4343@Gmail.com",
      age: 28,
      password: "MyPass123!",
    })
    .expect(201);

  //Assert the the DB was changed properlly
  const user = await User.findById(response.body.userInstance._id);
  expect(user).not.toBeNull();

  //Assertion about response
  expect(response.body).toMatchObject({
    userInstance: {
      name: "Noamy",
      email: "noam4343@gmail.com",
    },
    token: user.tokens[0].token,
  });
  expect(user.password).not.toBe("MyPass123!");
});

test(`Should login existing user`, async () => {
  const response = await request(app)
    .post(`/users/login`)
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userOneId);

  //Assert token is saved.
  expect(response.body.token).toBe(user.tokens[1].token);
});

test(`Should not login a nonexistent user`, async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "please121212",
    })
    .expect(400);
});

test("Should get profile for auth user", async () => {
  await request(app)
    .get(`/users/me`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete account for auth user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("Should not delete account for un-auth user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should upload avatar image buffer", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200);

  //assert
  const user = await User.findById(userOneId);
  expect(user.avatars).toEqual(expect.any(Buffer));
});
test("Should update Valid user fields", async () => {
  await request(app)
    .patch("/users/me")

    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "OriSnitch",
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toEqual("OriSnitch");
});

test("Should NOT update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")

    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: "OriSnitch",
    })
    .expect(404);
});
