import express from 'express';
import Message from '../models/Message.js';
import RoomMessage from '../models/RoomMessage.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Notification from "../models/Notification.js";
import { sendNotification } from "../socket/socket.js";
import { isAuthenticated } from '../middleware/authMiddleware.js';
const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get all rooms + lastMessage
// Get all rooms + lastMessage
router.get('/rooms', isAuthenticated, async (req, res) => {
  try {
    const rooms = await Room.find().lean();
    const withLast = await Promise.all(rooms.map(async room => {
      const last = await Message.findOne({ room: room._id }).sort({ createdAt: -1 }).lean();
      return {
        ...room,
        lastMessage: last ? { senderId: last.sender.toString(), content: last.content, timestamp: last.createdAt } : null
      };
    }));
    res.json(withLast);
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Create a new room
import crypto from 'crypto';

router.post('/rooms', async (req, res) => {
  const { name, description, isPrivate, createdBy, members } = req.body;
  try {
    const joinCode = isPrivate ? crypto.randomBytes(3).toString('hex') : null;
    const room = new Room({ name, description, isPrivate, createdBy, members, joinCode });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    console.error('Failed to create room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});


// Get room members
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

// Join a room
router.post('/rooms/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.members.includes(userId)) return res.status(400).json({ error: 'Already a member' });

    room.members.push(userId);
    await room.save();

    const member = await User.findById(userId).select('username profileImage').lean();

    res.json({
      roomId,
      member: {
        id: member._id.toString(),
        username: member.username,
        profileImage: member.profileImage
      }
    });
  } catch (err) {
    console.error('POST /rooms/:roomId/join failed:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Leave a room
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

// Get old Message model messages in a room
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

// Get RoomMessage collection messages in a room
router.get('/rooms/:roomId/roommessages', async (req, res) => {
  const { roomId } = req.params;
  try {
    const messages = await RoomMessage.find({ room: roomId })
      .sort({ createdAt: 1 })
      .populate('sender', 'username profileImage')
      .lean();
    res.json(messages);
  } catch (error) {
    console.error('Failed to fetch room messages:', error);
    res.status(500).json({ error: 'Failed to fetch room messages' });
  }
});

// Post a new RoomMessage
router.post('/rooms/:roomId/roommessages', async (req, res) => {
  const { roomId } = req.params;
  const { senderId, content } = req.body;
  try {
    const newMsg = await RoomMessage.create({
      room: roomId,
      sender: senderId,
      content,
    });
    res.status(201).json(newMsg);
  } catch (error) {
    console.error('Failed to post room message:', error);
    res.status(500).json({ error: 'Failed to post room message' });
  }
});

// Get all users
// Get recent messages for a user
router.get('/recent/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('sender', 'username profileImage')
    .populate('recipient', 'username profileImage');
    
    res.json(messages);
  } catch (error) {
    console.error('Failed to fetch recent messages:', error);
    res.status(500).json({ error: 'Failed to fetch recent messages' });
  }
});

// Get all users
router.get('/users', isAuthenticated, async (req, res) => {
  try {
    const users = await User.find({}, '_id username');
    res.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get private messages between two users
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

// Get recent conversations for user
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
      const partner = msg.sender._id.equals(userId) ? msg.recipient : msg.sender;
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
          partnerId: partner._id.toString(),
          partnerName: partner.username,
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

// Mark a message as read
router.put('/read/:messageId', async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.messageId, { isRead: true }, { new: true });
    if (!msg) return res.status(404).json({ error: 'Not found' });
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});
// POST /api/chat/rooms/join-by-code
router.post('/rooms/join-by-code', async (req, res) => {
  const { userId, code } = req.body;

  try {
    const room = await Room.findOne({ joinCode: code });
    if (!room) return res.status(404).json({ error: 'Invalid code' });

    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    const member = await User.findById(userId).select('username profileImage').lean();

    res.json({
      roomId: room._id,
      roomName: room.name,
      member: {
        id: member._id.toString(),
        username: member.username,
        profileImage: member.profileImage,
      },
    });
  } catch (error) {
    console.error('Failed to join by code:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});



router.post("/rooms/:roomId/invite", async (req, res) => {
  const { roomId } = req.params;
  const { fromUserId, toUsername } = req.body;

  try {
    console.log("▶️ Invite API called with:", { roomId, fromUserId, toUsername });

    const room = await Room.findById(roomId);
    if (!room) return res.status(400).json({ error: "Room not found" });

    if (!room.isPrivate) return res.status(400).json({ error: "Room is not private" });

    if (!room.members.map(id => id.toString()).includes(fromUserId)) {
      return res.status(403).json({ error: "You are not a member of this room" });
    }

    const fromUser = await User.findById(fromUserId);
    if (!fromUser) return res.status(404).json({ error: "Inviter user not found" });

    const toUser = await User.findOne({ username: toUsername });
    if (!toUser) return res.status(404).json({ error: "User to invite not found" });

    if (!room.joinCode) return res.status(400).json({ error: "Room has no join code" });

    const message = `${fromUser.username} invited you to join "${room.name}". Join code: ${room.joinCode}`;

    // Save notification in DB
    const notification = new Notification({
      userId: toUser._id,
      message,
    });
    await notification.save();
    console.log(`✅ Notification saved for ${toUsername}`);

    // Send notification through helper
    await sendNotification(toUser._id, message, req.io);
    console.log(`📢 Socket event sent to user ${toUsername}`);

    res.json({ success: true, message: "Invitation sent" });
  } catch (err) {
    console.error("❌ Failed to send invite:", err.message, err.stack);
    res.status(500).json({ error: "Failed to send invite" });
  }
});






export default router;
