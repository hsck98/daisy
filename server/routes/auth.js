import express from "express";
import passport from "passport";

var router = express.Router();

const LOGIN_URL = "http://localhost:3000/login";
const HOME_URL = "http://localhost:3000/";

router.get("/login/success", (req, res) => {
  console.log("Checking Auth from App");
  console.log(req.user);
  if (req.user) {
    res.status(200).json({
      success: true,
      user: req.user,
      cookies: req.cookies,
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

router.get("/logout", function (req, res) {
  console.log("logging out, user:" + req.user);
  req.logout((err) => {
    console.log("inside logout");
    if (err) {
      console.log("error: " + err);
      res.status(500).json({ message: "Error logging out" });
    } else {
      console.log("destorying session in logout");
      req.session.destroy(function (err) {
        if (err) {
          console.log("error: " + err);
          res.status(500).json({ message: "Error destroying session" });
        } else {
          res.clearCookie("connect.sid");
          res.status(200).json({ message: "Logged out successfully" });
        }
      });
    }
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login/failed",
  }),
  (req, res) => {
    res.status(200).json({
      success: true,
      user: req.user,
      cookies: req.cookies,
    });
  }
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/daisy",
  passport.authenticate("google", {
    successRedirect: HOME_URL,
    failureRedirect: "/login/failed",
  })
);

export default router;
