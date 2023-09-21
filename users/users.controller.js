const express = require("express");
const router = express.Router();
const userService = require("./user.service");
const getIP = require("ipware")().get_ip;

// routes
router.post("/authenticate", authenticate);
router.post("/register", register);
router.get("/", getAll);
router.get("/audit", getAuditUsers);
router.get("/current", getCurrent);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", _delete);
router.post("/logout", signOut);

module.exports = router;

function authenticate(req, res, next) {
  userService
    .authenticate(req.body)
    .then((user) =>
      user
        ? res.json(user)
        : res.status(400).json({ message: "Username or password is incorrect" })
    )
    .catch((err) => next(err));
}

function register(req, res, next) {
  userService
    .create(req.body)
    .then(() => res.json({}))
    .catch((err) => next(err));
}

function getAll(req, res, next) {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch((err) => next(err));
}

function getCurrent(req, res, next) {
  userService
    .getById(req.user.sub)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch((err) => next(err));
}

function getById(req, res, next) {
  userService
    .getById(req.params.id)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch((err) => next(err));
}

function update(req, res, next) {
  userService
    .update(req.params.id, req.body)
    .then(() => res.json({}))
    .catch((err) => next(err));
}

function _delete(req, res, next) {
  userService
    .delete(req.params.id)
    .then(() => res.json({}))
    .catch((err) => next(err));
}

function signOut(req, res, next) {
  const body = req.body;

  userService
    .signOff(body)
    .then(() => res.json({}))
    .catch((err) => next(err));
}

function getAuditUsers(req, res, next) {
  const role = "AUDITOR";

  userService
    .findUser(req.user.sub)
    .then((user) => {
      if (user.role.toUpperCase() === role) {
        userService
          .getAuditUserData(role)
          .then((users) => {
            res.json(users);
          })
          .catch((err) => {
            next(err);
          });
      } else {
        res.status(401).json({});
      }
    })
    .catch((err) => {
      next(err);
    });
}
