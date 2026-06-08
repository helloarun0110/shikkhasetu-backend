const volunteerQuery = require("../queries/volunteer.query");
const pool = require("../config/db");
const { createNotification } = require("../utils/notification.helper");

const getVolunteerRequests = async (userId, page, limit) => {
  return await volunteerQuery.getVolunteerRequests(userId, limit, page);
};

const getVolunteerAcceptedRequests = async (userId, page, limit) => {
  return await volunteerQuery.getVolunteerAcceptedRequests(userId, limit, page);
};

const getVolunteerDashboardStats = async (userId) => {
  return await volunteerQuery.getVolunteerDashboardStats(userId);
};

const getFilteredVolunteers = async (filters) => {
  return await volunteerQuery.getFilteredVolunteers(filters);
};

const addSubject = async (userId, subjectId, skillLevel) => {
  const profile = await volunteerQuery.getProfileByUserId(userId);
  if (!profile) throw new Error("Volunteer profile not found");
  return await volunteerQuery.addSubject(profile.id, subjectId, skillLevel);
};

const addAvailability = async (userId, data) => {
  const profile = await volunteerQuery.getProfileByUserId(userId);
  if (!profile) throw new Error("Volunteer profile not found");
  return await volunteerQuery.addAvailability({
    ...data,
    volunteer_profile_id: profile.id,
  });
};

const addClass = async (userId, classId) => {
  const profile = await volunteerQuery.getProfileByUserId(userId);
  if (!profile) throw new Error("Volunteer profile not found");
  return await volunteerQuery.addClass(profile.id, classId);
};

const getVolunteerClasses = async (volunteerId) => {
  const classes = await volunteerQuery.getVolunteerClasses(volunteerId);
  return classes;
};

const getVolunteerSubjects = async (volunteerId) => {
  return await volunteerQuery.getVolunteerSubjects(volunteerId);
};

const getVolunteerAvailability = async (volunteerId) => {
  return await volunteerQuery.getVolunteerAvailability(volunteerId);
};


const updateProfile = async (userId, data) => {
  return await volunteerQuery.updateProfile(userId, data);
};

const removeClass = async (userId, classId) => {
  const profile = await volunteerQuery.getProfileByUserId(userId);
  if (!profile) throw new Error("Volunteer profile not found");
  return await volunteerQuery.removeClass(profile.id, classId);
};

const getFullProfile = async (userId) => {
  const profile = await volunteerQuery.getFullProfile(userId);
  if (!profile) throw new Error("Profile not found");
  return profile;
};

const removeSubject = async (userId, subjectId) => {
  const profile = await volunteerQuery.getProfileByUserId(userId);
  if (!profile) throw new Error("Profile not found");
  return await volunteerQuery.removeSubject(profile.id, subjectId);
};

const removeAvailability = async (userId, availabilityId) => {
  const profile = await volunteerQuery.getProfileByUserId(userId);
  if (!profile) throw new Error("Profile not found");
  return await volunteerQuery.removeAvailability(availabilityId, profile.id);
};

const updateAvailability = async (userId, availabilityId, data) => {
  const profile = await volunteerQuery.getProfileByUserId(userId);
  if (!profile) throw new Error("Profile not found");
  return await volunteerQuery.updateAvailability(
    availabilityId,
    profile.id,
    data,
  );
};

module.exports = {
  getVolunteerRequests,
  getVolunteerAcceptedRequests,
  getVolunteerDashboardStats,
  getFilteredVolunteers,

  addSubject,
  addAvailability,
  addClass,
  removeClass,
  removeSubject,
  removeAvailability,
  updateAvailability,

  getVolunteerClasses,
  getVolunteerSubjects,
  getVolunteerAvailability,

  updateProfile,

  getFullProfile,
};
