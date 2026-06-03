const sessionQuery = require("../queries/session.query");

const getMySessions = async (userId, role) => {
  return await sessionQuery.getMySessions(userId, role);
};

const getSessionById = async (id) => {
  const session = await sessionQuery.getSessionById(id);
  if (!session) throw new Error("Session not found");
  return session;
};

const completeSession = async (id, notes) => {
  await sessionQuery.completeSession(id, notes);
  return { message: "Session marked as completed" };
};

const cancelSession = async (id) => {
  await sessionQuery.cancelSession(id);
  return { message: "Session cancelled" };
};

module.exports = { getMySessions, getSessionById, completeSession, cancelSession };
