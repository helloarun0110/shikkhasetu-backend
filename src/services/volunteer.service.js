const volunteerQuery = require("../queries/volunteer.query");
const pool = require("../config/db");
const {createNotification} = require("../utils/notification.helper");

const createProfile = async (data) => {
  const existing = await volunteerQuery.getProfileByUserId(data.user_id);
  if (existing) {
    throw new Error("Volunteer profile already exists");
  }
  return await volunteerQuery.createProfile(data);
};

const getProfile = async (userId) => {
  const profile = await volunteerQuery.getProfileByUserId(userId);
  if (!profile) throw new Error("Profile not found");
  return profile;
};

const updateProfile = async (userId, data) => {
  return await volunteerQuery.updateProfile(userId, data);
};

const getFilteredVolunteers = async (filters) => {
  return await volunteerQuery.getFilteredVolunteers(filters);
};

const updateOpenStatus = async (userId, isOpen) => {
  await volunteerQuery.updateOpenStatus(userId, isOpen);

  if (isOpen){

    const profile = await volunteerQuery.getProfileByUserId(userId);
    if(!profile) return {open_to_volunteer: isOpen};

    const [organizers] = await pool.execute(
      `SELECT op.id, u.id AS user_id, u.full_name
        FROM organizer_profiles op
        JOIN users u ON op.user_id = u.id
        WHERE op.district = ?
        AND u.is_active = TRUE
      `, [profile.district]
    );




    for (const org of organizers){
      await createNotification({
        user_id: org.user_id,
        type: "new_open_volunteer",
        title: "new volunteer available nearby",
        message: `&{profile.full_name} from &{profile.university_name} is now open to volunteer in &{profile.district}.`,
        
      });
    }


  }
  return { open_to_volunteer: isOpen };
};

const addSubject = async (userId, subjectId, skillLevel) => {
  const profile = await volunteerQuery.getProfileByUserId(userId);
  if (!profile) throw new Error("Volunteer profile not found");
  return await volunteerQuery.addSubject(profile.id, subjectId, skillLevel);
};

const addAvailability = async (userId, data) => {
  const profile = await volunteerQuery.getProfileByUserId(userId);
  if (!profile) throw new Error("Volunteer profile not found");
  return await volunteerQuery.addAvailability({ ...data, volunteer_profile_id: profile.id });
};

const getMyRequests = async (userId) => {
  return await volunteerQuery.getMyRequests(userId);
};

module.exports = {
  createProfile,
  getProfile,
  updateProfile,
  getFilteredVolunteers,
  updateOpenStatus,
  addSubject,
  addAvailability,
  getMyRequests,
};
