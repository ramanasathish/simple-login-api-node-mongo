const config = require("config.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("_helpers/db");
const User = db.User;

module.exports = {
  authenticate,
  getAll,
  getById,
  create,
  update,
  delete: _delete,
  signOff,
  getAuditUserData,
  findUser
};

async function authenticate({ username, password }) {
  const user = await User.findOne({ username });

  if (user && bcrypt.compareSync(password, user.hash)) {
    const { hash, ...userWithoutHash } = user.toObject();
    const token = jwt.sign({ sub: user.id }, config.secret);
    const userLoginTime = Date.now().toString();
    const clientIP = req.connection.remoteAddress;
    const updatedUser = await User.updateOne({ username }, { userLoginTime,clientIP });
    return {
      ...userWithoutHash,
      token,
    };
  }
}

async function getAll() {
  return await User.find().select("-hash");
}

async function getById(id) {
  return await User.findById(id).select("-hash");
}

async function create(userParam) {
  // validate
  if (await User.findOne({ username: userParam.username })) {
    throw 'Username "' + userParam.username + '" is already taken';
  }

  const user = new User(userParam);

  // hash password
  if (userParam.password) {
    user.hash = bcrypt.hashSync(userParam.password, 10);
  }

  // save user
  await user.save();
}

async function update(id, userParam) {
  const user = await User.findById(id);

  // validate
  if (!user) throw "User not found";
  if (
    user.username !== userParam.username &&
    (await User.findOne({ username: userParam.username }))
  ) {
    throw 'Username "' + userParam.username + '" is already taken';
  }

  // hash password if it was entered
  if (userParam.password) {
    userParam.hash = bcrypt.hashSync(userParam.password, 10);
  }

  // copy userParam properties to user
  Object.assign(user, userParam);

  await user.save();
}

async function _delete(id) {
  await User.findByIdAndRemove(id);
}

async function findUser(id){
    return await User.findOne({ _id: id}).select("-hash");
}
async function signOff(id) {
  const timeStamp = Date.now().toString();
  const updatedUser = await User.updateOne({ username }, { userOutTime });
  let data = {
    message: "Sucess",
    logoutTime: timeStamp,
  };

  return data;
}

async function getAuditUserData(role) {
  return await User.find({role}).select("-hash");
}
