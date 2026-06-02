const organizerQuery = require("../queries/organizer.query");

const createProfile = async (data) => {
  const existing = await organizerQuery.getProfileByUserId(data.user_id);
  if (existing) throw new Error("Organizer profile already exists");
  return await organizerQuery.createProfile(data);
};

const getProfile = async (userId) => {
  const profile = await organizerQuery.getProfileByUserId(userId);
  if (!profile) throw new Error("Profile not found");
  return profile;
};

const getSentRequests = async (userId) => {
  return await organizerQuery.getSentRequests(userId);
};

const getDashboardStats = async (userId) => {
  return await organizerQuery.getDashboardStats(userId);
};


const updateProfile = async(userId, data) => {
  return await organizerQuery.updateProfile(userId, data);
}


module.exports = { createProfile, getProfile, getSentRequests, getDashboardStats, updateProfile };
