// Activity veri modeli
const Activity = {
  activityId: "string", // Unique ID
  userId: "string", // Activiteyi oluşturan user
  title: "string",
  description: "string",
  sport: "string", // "basketball", "football", vb.
  location: "string",
  date: "timestamp", // Aktivitenin yapılacağı tarih
  time: "string", // "14:30"
  duration: "number", // Dakika cinsinden
  maxParticipants: "number",
  currentParticipants: "number",
  participants: ["array of userIds"],
  level: "string", // "beginner", "intermediate", "advanced"
  ageGroup: "string", // "18-25", "25-35", vb.
  image: "string (URL)",
  createdAt: "timestamp",
  updatedAt: "timestamp"
};

module.exports = Activity;