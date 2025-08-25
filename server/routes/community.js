const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const Message = require('../models/Message');

// Get all communities
router.get('/', async (req, res) => {
  const communities = await Community.find();
  res.json(communities);
});

//create new cpmmunity
router.post('/', async (req, res) => {
  const { name, description, owner } = req.body;
  const exists = await Community.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
  if (exists) {
    return res.status(400).json({ error: 'A community with this name already exists.' });
  }
  const community = new Community({ name, description, members: [owner], owner });
  await community.save();
  res.json(community);
});

// Join a community
router.post('/:id/join', async (req, res) => {
  const { userId } = req.body;
  const community = await Community.findById(req.params.id);
  if (!community.members.includes(userId)) {
    community.members.push(userId);
    await community.save();
  }
  res.json({ success: true });
});

// Leave a community
router.post('/:id/leave', async (req, res) => {
  const { userId } = req.body;
  const community = await Community.findById(req.params.id);
  community.members = community.members.filter(id => id !== userId);
  await community.save();
  res.json({ success: true });
});

// Get messages for a community
router.get('/:id/messages', async (req, res) => {
  const messages = await Message.find({ community: req.params.id });
  res.json(messages);
});

// Post a message
router.post('/:id/messages', async (req, res) => {
  const { userId, userName, text } = req.body;
  const message = new Message({ community: req.params.id, userId, userName, text });
  await message.save();
  res.json(message);
});

router.delete('/:id', async (req, res) => {
  const { userId } = req.body;
  const community = await Community.findById(req.params.id);
  if (!community) return res.status(404).json({ error: 'Community not found' });
  if (community.owner !== userId) return res.status(403).json({ error: 'Not authorized' });
  await Community.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;