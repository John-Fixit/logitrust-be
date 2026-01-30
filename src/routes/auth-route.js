const { createAccount, loginAccount } = require("../controllers/auth/register");

const authRouter = require("express").Router();

authRouter.post("/register", createAccount);
authRouter.post("/login", loginAccount);

module.exports = authRouter;
