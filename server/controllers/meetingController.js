const Meeting = require('../models/Meeting');
const dayjs = require('dayjs');

// Create a new meeting
exports.createMeeting = async (req, res) => {
  try {
    console.log('Creating meeting with data:', req.body);
    
    // Get creator from various possible sources
    const creator = req.user?.id || req.user?.email || req.body.creator || req.headers.authorization?.replace('Bearer ', '') || 'anonymous';
    
    console.log('Creator determined as:', creator);
    
    // Validate required fields
    if (!req.body.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!req.body.date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    if (!req.body.time) {
      return res.status(400).json({ error: 'Time is required' });
    }
    if (!req.body.language) {
      return res.status(400).json({ error: 'Language is required' });
    }
    
    const meetingData = {
      ...req.body,
      creator,
      topics: req.body.topics || [],
      registrations: [],
      attendees: [],
      archived: false,
      createdAt: new Date()
    };
    
    console.log('Meeting data to save:', meetingData);
    
    const meeting = new Meeting(meetingData);
    await meeting.save();
    
    console.log('Meeting created successfully:', meeting._id);
    res.status(201).json(meeting);
  } catch (err) {
    console.error('Error creating meeting:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get upcoming meetings (date >= today, not archived)
exports.getUpcomingMeetings = async (req, res) => {
  try {
    const { lang } = req.query;
    const today = new Date().toISOString().split('T')[0];
    const meetings = await Meeting.find({
      date: { $gte: today },
      archived: false,
      ...(lang ? { language: lang } : {})
    }).sort({ date: 1, time: 1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get archived meetings (date < today or archived)
exports.getArchivedMeetings = async (req, res) => {
  try {
    const { lang } = req.query;
    const today = new Date().toISOString().split('T')[0];
    const meetings = await Meeting.find({
      $or: [
        { date: { $lt: today } },
        { archived: true }
      ],
      ...(lang ? { language: lang } : {})
    }).sort({ date: -1, time: -1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get live meeting (currently happening or recently started)
exports.getLiveMeeting = async (req, res) => {
  try {
    const { lang } = req.query;
    const today = new Date().toISOString().split('T')[0];
    const now = dayjs();
    
    console.log('Checking for live meetings on:', today);
    console.log('Current time:', now.format('YYYY-MM-DD HH:mm'));
    
    // Find meetings for today, not archived, correct type
    const meetings = await Meeting.find({
      date: today,
      archived: false,
      ...(lang ? { language: lang } : {}),
      type: { $in: ['qna', 'webinar'] }
    }).sort({ time: 1 });
    
    console.log('Found meetings for today:', meetings.length);
    
    for (const meeting of meetings) {
      const meetingStart = dayjs(`${meeting.date}T${meeting.time}`);
      const meetingEnd = meetingStart.add(2, 'hour'); // Assume 2 hour duration if not specified
      
      console.log(`Meeting: ${meeting.title}`);
      console.log(`Start: ${meetingStart.format('YYYY-MM-DD HH:mm')}`);
      console.log(`End: ${meetingEnd.format('YYYY-MM-DD HH:mm')}`);
      console.log(`Is now after start: ${now.isAfter(meetingStart)}`);
      console.log(`Is now before end: ${now.isBefore(meetingEnd)}`);
      
      // Check if meeting is currently happening (started and not ended)
      if (now.isAfter(meetingStart) && now.isBefore(meetingEnd)) {
        console.log('Found live meeting:', meeting.title);
        return res.json(meeting);
      }
    }
    
    console.log('No live meetings found');
    res.json({});
  } catch (err) {
    console.error('Error in getLiveMeeting:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update a meeting by ID
exports.updateMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a meeting by ID
exports.deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ message: 'Meeting deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Register for a meeting (add to attendees)
exports.registerForMeeting = async (req, res) => {
  try {
    const { name, email, phone, organization, experience, questions, sessionId, userId } = req.body;
    
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    // Create registration object
    const registration = {
      name,
      email,
      phone,
      organization: organization || '',
      experience: experience || 'beginner',
      questions: questions || '',
      userId: userId || email,
      registrationDate: new Date()
    };

    // Store registration in meeting (you might want to create a separate Registration model)
    if (!meeting.registrations) meeting.registrations = [];
    
    // Check if user is already registered
    const existingRegistration = meeting.registrations.find(reg => reg.email === email);
    if (existingRegistration) {
      return res.status(400).json({ error: 'You are already registered for this meeting' });
    }

    meeting.registrations.push(registration);
    await meeting.save();

    res.json({ 
      success: true, 
      message: 'Registration successful',
      registration: registration
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get attendees for a meeting
exports.getMeetingAttendees = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    
    const attendees = meeting.registrations || [];
    res.json(attendees);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get user registrations
exports.getUserRegistrations = async (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '') || req.query.userId;
    if (!userId) return res.json([]);

    // Find all meetings where user is registered
    const meetings = await Meeting.find({
      'registrations.userId': userId
    });

    const registrations = meetings.map(meeting => ({
      sessionId: meeting._id,
      meetingTitle: meeting.title,
      registrationDate: meeting.registrations.find(reg => reg.userId === userId)?.registrationDate
    }));

    res.json(registrations);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Mark a meeting as live (for now, just log or set a flag if needed)
exports.goLiveMeeting = async (req, res) => {
  try {
    // Optionally, set a live flag or log the action
    // For now, just respond OK
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 