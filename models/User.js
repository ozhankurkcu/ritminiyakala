// User veri modeli
const User = {
  userId: "string", // Unique ID (Firebase Auth UID)
  email: "string",
  displayName: "string",
  profileImage: "string (URL)",
  bio: "string",
  joinedDate: "timestamp",
  location: "string",
  sports: ["array of strings"], // ["basketball", "football", ...]
  createdAt: "timestamp",
  updatedAt: "timestamp"
};

module.exports = User;