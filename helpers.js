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

module.exports = { getUserByEmail };