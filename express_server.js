const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString, emailExist, findEmail, urlsForUser } = require('./helpers');
const { urlDatabase, users } = require('./database');
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
const PORT = 8080; // default port 8080

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
  } else if (req.body.password === '') {
    res.status(400).send('Empty password!');
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
    urlDatabase[newID] = {};
    urlDatabase[newID]['longURL'] = req.body.longURL;
    urlDatabase[newID]['userID'] = req.session.user_id;
    console.log(urlDatabase);
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
  if (urlDatabase[req.params.id]) {
    if (urlDatabase[req.params.id].userID === req.session.user_id) {
      const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: user };
      res.render("urls_show", templateVars);
    } else {
      res.send('That url does not belong to you.');
    }
  } else {
    res.send('That url does not exist.');
  }
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
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