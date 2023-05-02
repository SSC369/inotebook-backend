const jwt = require("jsonwebtoken");
const secretKey = "SSC";

const fetchUser = (req, res, next) => {
  // get user from jwt token and add id to req object
  const token = req.header("auth-token");
  if (!token) {
    res
      .status(401)
      .send({ error: "Please authenticate using a valid JWT token" });
  }
  try {
    //extract payload data from the jwt by verifying jwt with the help of secret key.
    const data = jwt.verify(token, secretKey);
    req.user = data;
    next();
  } catch (error) {
    res
      .status(401)
      .send({ error: "Please authenticate using a valid JWT token" });
  }
};

module.exports = fetchUser;
