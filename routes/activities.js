const express = require('express');
const router = express.Router();

// GET - Tüm aktiviteleri listele
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        activityId: '1',
        userId: 'user1',
        title: 'Basketball Game',
        sport: 'basketball',
        location: 'Central Park',
        date: '2026-04-25',
        time: '14:00',
        participants: 5,
        maxParticipants: 10
      },
      {
        activityId: '2',
        userId: 'user2',
        title: 'Football Match',
        sport: 'football',
        location: 'Sports Field',
        date: '2026-04-26',
        time: '16:00',
        participants: 8,
        maxParticipants: 11
      }
    ]
  });
});

// GET - Belirli bir aktiviteyi getir
router.get('/:activityId', (req, res) => {
  const { activityId } = req.params;
  res.json({
    status: 'success',
    data: {
      activityId,
      userId: 'user1',
      title: 'Basketball Game',
      sport: 'basketball',
      location: 'Central Park',
      date: '2026-04-25',
      time: '14:00',
      participants: 5,
      maxParticipants: 10
    }
  });
});

// POST - Yeni aktivite oluştur
router.post('/', (req, res) => {
  const { title, sport, location, date, time, maxParticipants } = req.body;
  res.status(201).json({
    status: 'success',
    message: 'Activity created',
    data: {
      activityId: 'new-id-123',
      title,
      sport,
      location,
      date,
      time,
      maxParticipants,
      participants: 1
    }
  });
});

module.exports = router;