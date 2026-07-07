import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { messageService, authService } from '../../services/services';
import { timeAgo, getInitials } from '../../utils/helpers';
import { FiSend } from 'react-icons/fi';
import './TeamChat.css';

export default function TeamChat() {
  const { user } = useAuth();
  const { error } = useToast();
  const { joinRoom, leaveRoom, sendMessage, onNewMessage, emitTyping, onUserTyping } = useSocket();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [msgType, setMsgType] = useState('text'); // 'text', 'alert', 'update'
  const [typingUser, setTypingUser] = useState('');
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchPatients = async () => {
    try {
      const { data } = await authService.getLinkedUsers();
      const linkedList = data?.data?.linkedUsers || [];
      setPatients(linkedList);
      if (linkedList.length > 0) {
        setSelectedPatientId(linkedList[0]._id);
      }
    } catch (err) {
      error('Failed to load patients.');
    }
  };

  const fetchMessages = async () => {
    if (!selectedPatientId) return;
    try {
      const { data } = await messageService.getAll(selectedPatientId);
      setMessages(data?.data || []);
    } catch (err) {
      error('Failed to load team messages.');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [user]);

  // Handle Socket Room Joins and Subscriptions
  useEffect(() => {
    if (!selectedPatientId) return;

    fetchMessages();
    joinRoom(selectedPatientId);

    // Subscribe to new message broadcasts
    const unsubscribeNewMsg = onNewMessage((message) => {
      // Append only if message belongs to current selected patient room
      if (message.patientId === selectedPatientId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Subscribe to typing notifications
    const unsubscribeTyping = onUserTyping(({ userName }) => {
      setTypingUser(userName);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser('');
      }, 3000);
    });

    return () => {
      leaveRoom(selectedPatientId);
      unsubscribeNewMsg?.();
      unsubscribeTyping?.();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [selectedPatientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    emitTyping(selectedPatientId);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const payload = {
        patientId: selectedPatientId,
        senderId: user._id,
        content: inputText,
        type: msgType,
      };

      // Send to REST API (which saves and emits via Socket)
      await messageService.send(payload);
      
      // Clear input
      setInputText('');
      setMsgType('text');
    } catch (err) {
      error('Failed to broadcast message.');
    }
  };

  return (
    <div className="team-chat-container animate-fadeIn" id="team-chat-page">
      <header className="caregiver-header-block chat-header">
        <div>
          <span className="badge badge-primary">Care Coordination</span>
          <h1>Team Chat Room</h1>
        </div>
      </header>

      {patients.length > 1 && (
        <div className="patient-selector-wrapper">
          <label htmlFor="patient-select">Care context for:</label>
          <select
            id="patient-select"
            className="form-input"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
          >
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedPatientId ? (
        <div className="chat-window card">
          <div className="chat-log-box">
            {messages.length === 0 ? (
              <div className="chat-empty-state">
                <span>💬</span>
                <h3>No Messages Yet</h3>
                <p>Start a coordination message with other caregivers linked to this patient.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId?._id === user._id || msg.senderId === user._id;
                const senderName = msg.senderId?.name || 'Caregiver';
                return (
                  <div
                    key={msg._id}
                    className={`message-row ${isMe ? 'msg-right' : 'msg-left'} msg-type-${msg.type}`}
                  >
                    {!isMe && (
                      <div className="avatar avatar-placeholder chat-msg-avatar">
                        {getInitials(senderName)}
                      </div>
                    )}
                    <div className="chat-msg-bubble">
                      {!isMe && <span className="sender-name">{senderName}</span>}
                      <p>{msg.content}</p>
                      <span className="timestamp">{timeAgo(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
            {typingUser && <div className="typing-status-indicator">{typingUser} is typing...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="chat-footer-form">
            {/* Message Type Selector */}
            <div className="type-toggle-row">
              <button
                type="button"
                className={`type-chip ${msgType === 'text' ? 'active' : ''}`}
                onClick={() => setMsgType('text')}
                id="type-txt"
              >
                📝 Note
              </button>
              <button
                type="button"
                className={`type-chip ${msgType === 'update' ? 'active' : ''}`}
                onClick={() => setMsgType('update')}
                id="type-upd"
              >
                ℹ️ Update
              </button>
              <button
                type="button"
                className={`type-chip ${msgType === 'alert' ? 'active' : ''}`}
                onClick={() => setMsgType('alert')}
                id="type-alt"
              >
                🚨 Alert
              </button>
            </div>

            <div className="chat-input-row">
              <input
                type="text"
                placeholder="Type coordination updates..."
                className="form-input"
                value={inputText}
                onChange={handleInputChange}
                id="chat-text-input"
              />
              <button type="submit" className="btn btn-primary btn-icon" disabled={!inputText.trim()} id="chat-send">
                <FiSend />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="empty-state card">
          <p>Link with a patient to access the team coordination chat.</p>
        </div>
      )}
    </div>
  );
}
