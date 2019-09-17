const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const restricted = require("./middleware/restricted-middleware");
const session = require("express-session");
const Users = require("./users/users-model");

const server = express();

const sessionConfig = {
  name: "chocochip",
  secret: process.env.SESSION_SECRET || "keep it secret, keep it safe",
  cookie: {
    maxAge: 1000 * 60 * 60, // in milliseconds
    secure: false, //true means only send cookie over https
    httpOnly: true //True means JS has no access to the cookie
  },
  resave: false,
  saveUninitialized: true // GDPR Compliance
};

server.use(session(sessionConfig));

server.use(express.json());
server.use(cors());
server.get("/", (req, res) => {
  res.send("It's alive!");
});

server.post("/api/register", (req, res) => {
  let { username, password } = req.body;

  const hash = bcrypt.hashSync(password, 8); // it's 2 ^ 8, not 8 rounds

  Users.add({ username, password: hash })
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post("/api/login", (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      req.session.user = user;
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: "You cannot pass!" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get("/api/users", restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get("/api/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(error => {
      if (error) {
        res.status(500).json({
          message: "You can check out anytime you like, but you can never leave"
        });
      } else {
        res.status(200).json({ message: "Bye come back soon" });
      }
    });
  } else {
    res.status(200).json({ messsage: "already logged out" });
  }
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
