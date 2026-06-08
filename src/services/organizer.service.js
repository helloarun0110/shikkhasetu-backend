const organizerQuery = require("../queries/organizer.query");

const getOrganizerRequests = async (userId, page, limit) => {
  return await organizerQuery.getOrganizerRequests(userId, limit, page);
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


module.exports = { getOrganizerRequests, getProfile, getSentRequests, getDashboardStats, updateProfile };
