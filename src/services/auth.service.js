const bcrypt = require("bcrypt");
const authQuery = require("../queries/auth.query");
const generateToken = require("../utils/generateToken");

const register = async (data) => {
  const existingUser = await authQuery.findUserByEmail(data.email);

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const password_hash = await bcrypt.hash(data.password, 10);

  const result = await authQuery.createUser({ ...data, password_hash });

  const token = generateToken({ id: result.insertId, role: data.role });

  return { token, userId: result.insertId, role: data.role };
};

const login = async (email, password) => {
  const user = await authQuery.findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.is_active) {
    throw new Error("Account is deactivated");
  }

  const isMatched = await bcrypt.compare(password, user.password_hash);

  if (!isMatched) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({ id: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
};

const getMe = async (userId) => {
  const user = await authQuery.findUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

module.exports = { register, login, getMe };










