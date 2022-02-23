const express = require("express");
const auth = require("../middleware/auth");
const router = new express.Router();
const userModel = require(`../models/User`);
const multer = require("multer");
const sharp = require("sharp");
const { welcomeEmail, cancelationEmail } = require("../email/emails");

//Create User
router.post(`/`, async (req, res) => {
  const userInstance = new userModel(req.body);
  try {
    await userInstance.save();
    welcomeEmail(userInstance.email, userInstance.name);
    const token = await userInstance.generateAuthToken();
    res.status(201).json({ userInstance, token });
  } catch (error) {
    res.status(400).send(error);
    console.error(error);
  }
});

// Login User
router.post(`/login`, async (req, res) => {
  try {
    const user = await userModel.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

//get all users list -
/**
 * TODO - Fix this for only Admin authentication
 */
// router.get("/", async (req, res) => {
//   try {
//     const allUsersList = await userModel.find({});
//     res.send(allUsersList);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

/**
 * Logout first consider auth Middleware, recieves the token of current user
 * This function delete the specific token (specefic device) and deletes it from the list
 *
 */
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    //Saves the new Token array without the requested token - therefore logged out.
    await req.user.save();
    res.send("logged out");
  } catch (error) {
    res.status(500).send(error);
  }
});

// Does the same as logout but delete all tokens -
// No device remains authenticated
router.post("/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("logged out from all sessions");
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get profile of authenticated user
router.get("/me", auth, async (req, res) => {
  res.send(req.user);
});

/**
 * * Typically - Update(patch) requset contain the most code
 *  request contains in body Keys and Values.
 * @updates - take the keys from the reqObject
 * @isValidUpdateOperation - cross refference between @allowedUpdate and @updates
 */
router.patch("/me", auth, async (req, res) => {
  // Validating update object-keys

  const updates = Object.keys(req.body);
  const allowedUpdates = [`name`, `age`, `email`, `password`];
  const isValidUpdateOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdateOperation) {
    res.status(404).send(`Error : Invalid  update fields`);
  }

  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });

    await req.user.save();

    res.json(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete auth User
router.delete(`/me`, auth, async (req, res) => {
  try {
    await req.user.remove();
    cancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @upload - use multer to upload files
 * @RegExp /\.(jpg|jpeg|png)$/ - Validates that filename is ending correctly
 */
const upload = multer({
  limits: { fileSize: 1000000 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Enter a valid file."));
    }
    cb(undefined, true);
  },
});

/**
 * Use upload as middleware - takes the file from request.
 * @sharp is used to convert the file to png and most importantly -->
 * * - convert the file into binary data, and then it could be uploaded to Mongo
 */

router.post(
  "/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer)
        .resize(250, 250)
        .png()
        .toBuffer();
      req.user.avatars = buffer;
      await req.user.save();
      res.send();
    } catch (error) {
      res.status(404).send();
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//Delete Avatar by deleting avatars data from MongoDB

router.delete("/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatars = undefined;
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
//Get avatar from user
//finds user - return PNG

router.get("/:id/avatar", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user || !user.avatars) {
      throw new Error();
    }
    // This Method is to set the res content Type - it is not JSON but a file.
    // neccassery for the browser to understand
    res.set("Content-Type", "image/png");
    res.send(user.avatars);
  } catch (error) {
    res.status(404).send();
  }
});
module.exports = router;
