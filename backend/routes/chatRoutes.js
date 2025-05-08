// routes/chatRoutes.js

import express from 'express';
import Message from '../models/Message.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

const router = express.Router();
// ——————————————
// Get all rooms + lastMessage
// ——————————————
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().lean();
    // for each room, look up its latest message
    const withLast = await Promise.all(rooms.map(async room => {
      const last = await Message.findOne({ room: room._id })
        .sort({ createdAt: -1 })
        .lean();
      return {
        ...room,
        lastMessage: last
          ? { senderId: last.sender.toString(), content: last.content, timestamp: last.createdAt }
          : null
      };
    }));
    res.json(withLast);
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// ——————————————
// Create a new room
// POST /api/chat/rooms
// ——————————————
router.post('/rooms', async (req, res) => {
  const { name, description, isPrivate, createdBy, members } = req.body;
  try {
    const room = new Room({ name, description, isPrivate, createdBy, members });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    console.error('Failed to create room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// ——————————————
// Get room members
// GET /api/chat/rooms/:roomId/members
// ——————————————
router.get('/rooms/:roomId/members', async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
      .populate('members', '_id username profileImage')
      .lean();
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room.members);
  } catch (error) {
    console.error('Failed to fetch room members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// ——————————————
// Join a room
// POST /api/chat/rooms/:roomId/join
// ——————————————
router.post('/rooms/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    // 1) Load the existing Room doc
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // 2) Prevent duplicates
    if (room.members.includes(userId)) {
      return res.status(400).json({ error: 'Already a member' });
    }

    // 3) Mutate and save — this will preserve createdBy, name, etc.
    room.members.push(userId);
    await room.save();

    // 4) (Optional) Return the new member’s public info
    const member = await User.findById(userId)
      .select('username profileImage')
      .lean();

    return res.json({
      roomId,
      member: {
        id:           member._id.toString(),
        username:     member.username,
        profileImage: member.profileImage
      }
    });
  } catch (err) {
    console.error('POST /rooms/:roomId/join failed:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
});


// ——————————————
// Leave a room
// POST /api/chat/rooms/:roomId/leave
// ——————————————
router.post('/rooms/:roomId/leave', async (req, res) => {
  const { userId } = req.body;
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    room.members = room.members.filter(id => id.toString() !== userId);
    await room.save();
    res.json(room);
  } catch (error) {
    console.error('Failed to leave room:', error);
    res.status(500).json({ error: 'Failed to leave room' });
  }
});
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
// POST /api/chat/rooms/:roomId/messages
router.post('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { content, senderId } = req.body;
    const msg = await Message.create({
      room:    req.params.roomId,
      content,
      sender:  senderId
    });
    await msg.populate('sender', 'username');

    // return flattened
    res.status(201).json({
      content:   msg.content,
      senderId:  msg.sender._id.toString(),
      roomId:    msg.room.toString(),
      createdAt: msg.createdAt
    });
  } catch (err) {
    console.error('POST /rooms/:roomId/messages failed:', err);  // :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}
    res.status(500).json({ error: 'Failed to send message' });
  }
});
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const msgs = await Message.find({ room: req.params.roomId })
      .sort({ createdAt: 1 })
      .populate('sender', 'username')      // still populate for username if you need it
      .lean();

    // flatten each message
    const out = msgs.map(m => ({
      content:   m.content,
      senderId:  m.sender._id.toString(),
      roomId:    m.room.toString(),
      createdAt: m.createdAt
    }));

    res.json(out);
  } catch (err) {
    console.error('GET /rooms/:roomId/messages failed:', err);  // :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
