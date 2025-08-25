const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');

// Create a meeting
router.post('/', meetingController.createMeeting);
// Get upcoming meetings
router.get('/upcoming', meetingController.getUpcomingMeetings);
// Get archived meetings
router.get('/archived', meetingController.getArchivedMeetings);
// Get live meeting
router.get('/live', meetingController.getLiveMeeting);
// Update a meeting
router.put('/:id', meetingController.updateMeeting);
// Delete a meeting
router.delete('/:id', meetingController.deleteMeeting);
// Register for a meeting
router.post('/:id/register', meetingController.registerForMeeting);
// Go live for a meeting
router.post('/:id/live', meetingController.goLiveMeeting);
// Get attendees for a meeting
router.get('/:id/attendees', meetingController.getMeetingAttendees);
// Get user registrations
router.get('/user/registrations', meetingController.getUserRegistrations);

module.exports = router; 