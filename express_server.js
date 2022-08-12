const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require('./helpers');
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.ca",
    userID: "user2RandomID"
  }
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

const emailExist = function(email) {
  //returns true if email exists in urlDatabase, false otherwise
  const usrs = Object.keys(users);
  for (let u of usrs) {
    if (users[u].email === email) {
      return true;
    }
  }
  return false;
};

const findEmail = function(email) {
  //returns the id of the user object of a given email
  const usrs = Object.keys(users);
  for (let u of usrs) {
    if (users[u].email === email) {
      return users[u].id;
    }
  }
  return undefined;
};

const urlsForUser = function(uid) {
  //return an orbject of short urls as keys and long urls as values
  const result = {};
  const urls = Object.keys(urlDatabase);
  for (let u of urls) {
    if (urlDatabase[u].userID === uid) {
      result[u] = urlDatabase[u].longURL;
    }
  }
  return result;
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.redirect('/login');
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { urls: urlsForUser(req.session.user_id), user: user };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user: user };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else if (req.body.email === '') {
    res.status(400).send('Empty email!');
  } else if (emailExist(req.body.email)) {
    res.status(400).send('Email already exists!');
  } else {
    const newID = generateRandomString();
    const user = {
      id: newID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    users[newID] = user;
    req.session.user_id = newID;
    res.redirect('/urls');
  }
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send('Must be logged in to shortened urls');
  } else {
    const newID = generateRandomString();
    urlDatabase[newID].longURL = req.body.longURL;
    urlDatabase[newID].userID = req.session.user_id;
    res.redirect('urls/' + newID);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const user = users[req.session.user_id];
    const templateVars = { user: user };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID === req.session.user_id) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.send('You can only edit URLs that belong to you.');
  }
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: user };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
  } else {
    res.send('This url does not exist!');
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userID === req.session.user_id) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.send('You can only delete URLs that belong to you.');
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = { user: undefined };
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  if (emailExist(req.body.email) && bcrypt.compareSync(req.body.password, users[findEmail(req.body.email)].password)) {
    req.session.user_id = findEmail(req.body.email);
    res.redirect('/urls');
  } else {
    res.status(403).send('Email not found or password incorrect.');
  }
});

app.post("/logout", (req, res) => {
  res.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});