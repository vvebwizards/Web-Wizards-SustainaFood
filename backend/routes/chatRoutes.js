// routes/chatRoutes.js

import express from 'express';
import Message from '../models/Message.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

const router = express.Router();

// ——————————————
// Get messages in a room
// ——————————————
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .sort({ createdAt: 1 })
      .populate('sender', 'username')
      .populate('recipient', 'username');
    res.json(messages);
  } catch (error) {
    console.error('Failed to fetch room messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ——————————————
// Get all rooms
// ——————————————
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// ——————————————
// Get all users (for sidebar/contact list)
// ——————————————
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '_id username');
    res.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ——————————————
// Get private messages between two users
// /api/chat/private/:recipientId/:senderId
// ——————————————
router.get('/private/:recipientId/:senderId', async (req, res) => {
  const { recipientId, senderId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: recipientId, recipient: senderId },
        { sender: senderId, recipient: recipientId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'username profileImage')
      .populate('recipient', 'username profileImage');
    res.json(messages);
  } catch (error) {
    console.error('Failed to load private messages:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// ——————————————
// Get recent conversations for user
// /api/chat/recent/:userId
// ——————————————
router.get('/recent/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('sender', 'username profileImage')
      .populate('recipient', 'username profileImage');

    const uniqueConversations = [];
    const seen = new Set();

    for (const msg of messages) {
      // determine the “other” user in this convo:
      const partner =
        msg.sender._id.equals(userId) ? msg.recipient : msg.sender;

      if (!seen.has(partner._id.toString())) {
        uniqueConversations.push({
          _id: msg._id,
          senderId: msg.sender._id.toString(),
          senderName: msg.sender.username,
          recipientId: msg.recipient._id.toString(),
          content: msg.content,
          timestamp: msg.createdAt,
          isRead: msg.isRead,
          profileImage: partner.profileImage,
          partnerId: partner._id.toString(),          // ← add this
          partnerName: partner.username,              // ← add this
        });
        seen.add(partner._id.toString());
      }
    }

    res.json(uniqueConversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load recent messages' });
  }
});

// ——————————————
// Mark a message as read
// PUT /api/chat/read/:messageId
// ——————————————
router.put('/read/:messageId', async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.messageId,
      { isRead: true },
      { new: true }
    );
    if (!msg) return res.status(404).json({ error: 'Not found' });
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

export default router;
