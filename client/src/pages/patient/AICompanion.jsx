import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { companionService } from '../../services/services';
import { FiArrowLeft, FiSend, FiTrash2 } from 'react-icons/fi';
import './AICompanion.css';

export default function AICompanion() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear your conversation history? This will start a fresh chat.")) {
      try {
        await companionService.clearHistory(user._id);
        setMessages([]);
        success("Conversation history cleared!");
      } catch (err) {
        error("Failed to clear chat history. Please try again.");
      }
    }
  };

  const loadHistory = async () => {
    try {
      const { data } = await companionService.getHistory(user._id);
      if (data && data.data) {
        setMessages(data.data || []);
      }
    } catch (err) {
      // Don't show error toast on initial empty load, just log
      console.log('No chat history loaded or API connection issue.');
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const messageText = textToSend || inputText;
    if (!messageText.trim()) return;

    // Add user message to UI
    const newUserMsg = { role: 'user', content: messageText, timestamp: new Date() };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');
    setLoading(true);
    setIsTyping(true);

    try {
      const { data } = await companionService.chat({
        patientId: user._id,
        message: messageText,
      });

      // Add model response to UI
      const newModelMsg = { role: 'model', content: data.data.aiResponse, timestamp: new Date() };
      setMessages((prev) => [...prev, newModelMsg]);
    } catch (err) {
      error('Sorry, I had trouble thinking. Let us try again!');
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const quickReplies = [
    'What day is it today?',
    'Tell me about my family.',
    'Who are you?',
    'What should I do now?',
  ];

  return (
    <div className="ai-companion-container animate-fadeIn" data-mode="patient" id="patient-companion-page">
      <header className="chat-header">
        <div className="header-left-col">
          <button className="btn btn-secondary back-btn" onClick={() => navigate('/patient')} id="back-to-home">
            <FiArrowLeft /> Back
          </button>
        </div>
        <div className="header-center-col">
          <div className="companion-avatar-wrapper animate-float">
            <span className="companion-bot-avatar">🤖</span>
          </div>
          <div className="companion-title-group">
            <h1 className="text-gradient">My Companion</h1>
            <p className="page-subtitle">Always here to help you remember</p>
          </div>
        </div>
        <div className="header-right-col">
          <button className="btn btn-ghost clear-chat-btn" onClick={handleClearHistory} id="clear-chat-history" aria-label="Clear chat history">
            <FiTrash2 /> <span>Clear Chat</span>
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="chat-messages-box">
        {messages.length === 0 && (
          <div className="chat-intro animate-scaleIn">
            <span className="intro-emoji">👋</span>
            <h2>Hello, {user.name}!</h2>
            <p>I am your helper. You can ask me anything about your family, dates, or simply tell me how you are feeling.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message-row animate-fadeInUp ${
              msg.role === 'user' ? 'message-user' : 'message-model'
            }`}
          >
            {msg.role === 'model' && <span className="message-bot-icon">🤖</span>}
            <div className="message-bubble">
              <p>{msg.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-message-row message-model">
            <span className="message-bot-icon">🤖</span>
            <div className="message-bubble typing-bubble">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="quick-replies-container">
        {quickReplies.map((reply, index) => (
          <button
            key={index}
            className="btn btn-secondary quick-reply-chip"
            onClick={() => handleSend(reply)}
            disabled={loading}
            id={`quick-reply-${index}`}
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="chat-input-form"
      >
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="form-input chat-text-input"
            placeholder="Type a message or question here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            id="chat-message-input"
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={loading || !inputText.trim()}
            id="chat-send-submit"
            aria-label="Send message"
          >
            <FiSend />
          </button>
        </div>
      </form>
    </div>
  );
}
