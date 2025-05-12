import mongoose from 'mongoose';
import RoomMessage from '../models/RoomMessage.js';

export const getRoomMessages = async (req, res) => {
  const { roomId } = req.params;
  console.log('[getRoomMessages] raw roomId:', roomId);

  // 1) Validate
  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    console.warn('[getRoomMessages] Invalid ObjectId:', roomId);
    return res.status(400).json({ error: 'Invalid roomId' });
  }
  // 2) Cast explicitly
  const objRoomId = mongoose.Types.ObjectId(roomId);
  console.log('[getRoomMessages] cast to ObjectId:', objRoomId);

  try {
    // 3) Disable client caching
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    // 4) Debug counts
    const totalDocs = await RoomMessage.countDocuments();
    console.log('[getRoomMessages] total roommessages:', totalDocs);

    const matchedDocs = await RoomMessage.countDocuments({ room: objRoomId });
    console.log('[getRoomMessages] matched roommessages:', matchedDocs);

    // 5) The actual query
    const messages = await RoomMessage
      .find({ room: objRoomId })
      .sort({ createdAt: 1 })
      .populate('sender', 'username profileImage')
      .lean();

    console.log('[getRoomMessages] find() returned:', messages.length);
    return res.json(messages);
  } catch (err) {
    console.error('[getRoomMessages] ERROR:', err);
    return res.status(500).json({ error: 'Failed to load room messages' });
  }
};


export const postRoomMessage = async (req, res) => {
  const { roomId } = req.params;
  console.log('🏷️ postRoomMessage for roomId =', roomId, 'body=', req.body);

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({ error: 'Invalid roomId' });
  }

  try {
    const { senderId, content } = req.body;
    const newMsg = await RoomMessage.create({ room: roomId, sender: senderId, content });
    console.log('✅ Created new message:', newMsg);
    return res.status(201).json(newMsg);
  } catch (err) {
    console.error('❌ Error creating room message:', err);
    return res.status(500).json({ error: 'Failed to save room message' });
  }
};


