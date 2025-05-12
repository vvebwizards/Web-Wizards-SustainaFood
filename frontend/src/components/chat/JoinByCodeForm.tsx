import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const JoinByCodeForm = ({ setShowJoinByCode, setSelectedRoom, currentUserId, theme }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const joinByCode = async () => {
    try {
      const res = await axios.post('/api/chat/rooms/join-by-code', { userId: currentUserId, code });
      setSelectedRoom(res.data);
      setShowJoinByCode(false);
    } catch (err) {
      setError('Invalid code or failed to join');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Join Room by Code</h3>
          <button onClick={() => setShowJoinByCode(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Enter join code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button onClick={joinByCode} className={`w-full px-4 py-2 ${theme.button} text-white rounded`}>
          Join Room
        </button>
      </div>
    </div>
  );
};

export default JoinByCodeForm;
