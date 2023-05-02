const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const fetchUser = require("../middlewares/fetchUser");

router.post(
  "/register",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid mail").isEmail(),
    body("password", "Choose correct password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //this errors are omitted when user requested with a bad credentials which are not passed our request conditions.
    try {
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        let user = await User.findOne({ email: req.body.email });
        //check whether user already exists
        if (user) {
          return res
            .status(400)
            .json({ error: "sorry a user with this email already exits." });
        } else {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(req.body.password, salt);

          //async/await method
          user = await User.create({
            name: req.body.name,
            password: hashedPassword,
            email: req.body.email,
          });

          const secretKey = "SSC";
          const payload = {
            id: user.id,
          };
          const jwtToken = await jwt.sign(payload, secretKey);
          res.json({ jwtToken, name: req.body.name });
        }
      }

      //password encryption , salt which add a random string with desired length to our user password , later that password is hashed and stored into the database.
    } catch (error) {
      //this try catch can be used if there are some errors in request can be identifies.
      console.error(error.message);
      res.status(500).json("Some error occured!");
    }
    // .then((user) => res.json(user))
    // .catch((err) => {
    //   console.log(err);
    //   res.json({
    //     error: "please enter a unique value",
    //     message: err.message,
    //   });
    // });

    // const user = User(req.body);
    // user.save();
    // res.json(req.body);
  }
);

//login route
router.post(
  "/login",
  [
    body("password", "Enter a Password").exists(),
    body("email", "Enter a Valid Email").isEmail(),
  ],
  async (req, res) => {
    const { password, email } = req.body;
    const errors = validationResult(req);
    //this errors are omitted when user requested with a bad credentials which are not passed our request conditions.
    try {
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        const user = await User.findOne({ email });
        if (!user) {
          res.status(400).json("User Not Found!");
        } else {
          const passwordCompare = await bcrypt.compare(password, user.password);
          if (!passwordCompare) {
            res.status(400).json("Password is Incorrect!");
          } else {
            const secretKey = "SSC";
            const payload = {
              id: user.id,
            };
            const jwtToken = await jwt.sign(payload, secretKey);
            res.send({ jwtToken, name: user.name });
          }
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json("Some error occured!");
    }
  }
);

router.post("/getUser", fetchUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Internal Server Error");
  }
});

module.exports = router;
