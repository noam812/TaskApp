const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header(`Authorization`).replace("Bearer ", "");
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    // Decode now has a _id value that is get from generateAuthToken as a payload
    //user looks for the _id of the user that have a match with active token

    const user = await User.findOne({ _id: decode._id, "tokens.token": token });

    //this Throw is going to be catched in the catch block
    if (!user) {
      throw new Error();
    }
    // save resource - we already fetched the user here so we can pass it in the request
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send(`error : Not authorized`);
  }
};

module.exports = auth;
