import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGreeting, formatDate } from '../../utils/helpers';
import './PatientDashboard.css';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const cards = [
    {
      id: 'tile-memories',
      title: 'My Memories',
      subtitle: 'See old photos and stories',
      emoji: '🖼️',
      colorClass: 'tile-blue',
      path: '/patient/memories',
    },
    {
      id: 'tile-routines',
      title: 'My Routines',
      subtitle: 'What should I do today?',
      emoji: '⏰',
      colorClass: 'tile-warm',
      path: '/patient/routines',
    },
    {
      id: 'tile-companion',
      title: 'Talk to Me',
      subtitle: 'Chat with your companion',
      emoji: '💬',
      colorClass: 'tile-purple',
      path: '/patient/companion',
    },
    {
      id: 'tile-family',
      title: 'My Family',
      subtitle: 'See family photos and details',
      emoji: '👨‍👩‍👧‍👦',
      colorClass: 'tile-green',
      path: '/patient/family',
    },
  ];

  return (
    <div className="patient-dashboard-container animate-fadeIn" data-mode="patient" id="patient-home">
      {/* Soft Ambient Background Elements */}
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>

      <header className="patient-hero-header">
        <h1 className="patient-greeting text-gradient">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="patient-date">Today is {formatDate(new Date())}</p>
        <div className="patient-large-clock animate-pulse">{timeString}</div>
        {user?.inviteCode && (
          <div className="patient-invite-banner card-interactive animate-scaleIn">
            <span>Caregiver Invite Code:</span>
            <strong className="invite-code-badge" id="patient-invite-code">{user.inviteCode}</strong>
          </div>
        )}
      </header>

      <main className="patient-tiles-grid">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            id={card.id}
            className={`patient-tile card-interactive animate-bounceIn delay-${idx + 1} ${card.colorClass}`}
            onClick={() => navigate(card.path)}
          >
            <div className="patient-tile-emoji">{card.emoji}</div>
            <div className="patient-tile-info">
              <h2>{card.title}</h2>
              <p>{card.subtitle}</p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
