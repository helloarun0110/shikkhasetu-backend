const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendResetEmail } = require("../utils/email.helper");
const authQuery = require("../queries/auth.query");
const generateToken = require("../utils/generateToken");
const volunteerQuery = require("../queries/volunteer.query");
const organizerQuery = require("../queries/organizer.query");
const pool = require("../config/db");

const register = async (data) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const existingUser = await authQuery.findUserByEmail(data.email, conn);
    if (existingUser) throw new Error("Email already registered");

    const password_hash = await bcrypt.hash(data.password, 10);

    const userResult = await authQuery.createUser(
      { ...data, password_hash },
      conn,
    );

    const userId = userResult.insertId;

    let profileId = null;

    if (data.role === "volunteer") {
      const profile = await volunteerQuery.createProfile(
        { ...data, user_id: userId },
        conn,
      );

      profileId = profile.insertId;

      await volunteerQuery.addSubjectsByName(
        profileId,
        data.subject_names,
        "intermediate",
        conn,
      );
      await volunteerQuery.addClassesByName(
        profileId,
        data.class_names,
        conn,
      );

      for (const slot of data.availability || []) {
        await volunteerQuery.addAvailability(
          { ...slot, volunteer_profile_id: profileId },
          conn,
        );
      }
    }

    if (data.role === "organizer") {
      await organizerQuery.createProfile({ ...data, user_id: userId }, conn);
    }

    await conn.commit();

    return {
      token: generateToken({ id: userId, role: data.role }),
      user: { userId, role: data.role },
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
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

const updateUserProfile = async (userId, data) => {
  if (!data.full_name?.trim()) throw new Error("Full name is required");
  if (!data.phone?.trim()) throw new Error("Phone is required");

  const bdPhoneRegex = /^(01[3-9]\d{8})$/;
  if (!bdPhoneRegex.test(data.phone)) {
    throw new Error("Invalid BD phone number (01XXXXXXXXX)");
  }

  return await authQuery.updateUserProfile(userId, data);
};

const updatePassword = async (userId, data) => {
  
  const user = await authQuery.findUserById(userId);
  if (!user) throw new Error("User not found");
    
   console.log("update password service","user " ,user,"current pass ",user.password_hash); 
  const isMatch = await bcrypt.compare(
    data.current_password,
    user.password_hash,
  );
 
  if (!isMatch) throw new Error("Current password is incorrect");
  
  if (data.new_password.length < 6)
    throw new Error("Password must be at least 6 characters");

  const passwordHash = await bcrypt.hash(data.new_password, 10);
  return await authQuery.updatePassword(userId, passwordHash);
};



const forgotPassword = async (email) => {
  const user = await authQuery.findUserByEmail(email);
  if (!user) throw new Error("Email not found");

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 60 * 1000); 

  await authQuery.saveResetToken(user.id, token, expires);
  await sendResetEmail(email, token);
};

const resetPassword = async (token, newPassword) => {
  const user = await authQuery.findUserByResetToken(token);
  if (!user) throw new Error("Invalid or expired token");

  if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await authQuery.updatePassword(user.id, passwordHash);
  await authQuery.clearResetToken(user.id);
};

module.exports = { register, login, getMe, updateUserProfile, updatePassword , resetPassword, forgotPassword };
