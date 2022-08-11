const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = function () {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

const emailExist = function (email) {
  const usrs = Object.keys(users);
  for (let u of usrs) {
    if (users[u].email === email) {
      return true;
    }
  }
  return false;
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user: user };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === '') {
    res.status(400).send('Empty email!');
  } else if (emailExist(req.body.email)) {
    res.status(400).send('Email already exists!');
  } else {
    const newID = generateRandomString();
    const user = {
      id: newID,
      email: req.body.email,
      password: req.body.password
    };
    users[newID] = user;
    res.cookie("user_id", newID);
    res.redirect('/urls');
  }
});

app.post("/urls", (req, res) => {
  const newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;
  res.redirect('urls/' + newID);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: user };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user: user };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  const templateVars = {
    username: username,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => {
  const user = users[req.cookies["user_id"]];
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});