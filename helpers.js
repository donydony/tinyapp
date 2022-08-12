const getUserByEmail = function(email, database) {
  // lookup magic...
  const usrs = Object.keys(database);
  for (let u of usrs) {
    if (database[u].email === email) {
      return database[u];
    }
  }
  return undefined;
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

module.exports = {
  getUserByEmail,
  generateRandomString,
  emailExist,
  findEmail,
  urlsForUser
};

