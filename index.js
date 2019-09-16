const express = require("express");
const bcrypt = require("bcryptjs");
const server = express();

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
