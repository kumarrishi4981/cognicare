import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { routineService, fileService } from '../../services/services';
import { formatTime, getCurrentDayShort } from '../../utils/helpers';
import { FiArrowLeft, FiPlay, FiCheck, FiInfo } from 'react-icons/fi';
import './MyRoutines.css';

export default function MyRoutines() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingAudioId, setPlayingAudioId] = useState(null);

  const fetchRoutines = async () => {
    try {
      const patientId = user?.role === 'patient' ? user?._id : user?.linkedPatients?.[0];
      if (!patientId) {
        setLoading(false);
        return;
      }
      const { data } = await routineService.getAll(patientId);
      setRoutines(data?.data || []);
    } catch (err) {
      error('Could not load routines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [user]);

  // Filter for routines scheduled for today
  const todayDay = getCurrentDayShort();
  const todayRoutines = routines.filter((r) => {
    if (!r.isActive) return false;
    // if repeatDays is empty, assume daily
    if (!r.repeatDays || r.repeatDays.length === 0) return true;
    return r.repeatDays.includes(todayDay);
  });

  // Check if completed today
  const isCompletedToday = (routine) => {
    const today = new Date().toDateString();
    return routine.completionLog.some((log) => new Date(log.date).toDateString() === today);
  };

  const handleComplete = async (routineId) => {
    try {
      await routineService.complete(routineId);
      success('Great job completing your task! ✨');
      fetchRoutines(); // Reload to update status
    } catch (err) {
      error(err.response?.data?.message || 'Failed to complete routine.');
    }
  };

  const playVoicePrompt = (routineId, fileId) => {
    const audioUrl = fileService.getFileUrl(fileId);
    const audio = new Audio(audioUrl);
    
    setPlayingAudioId(routineId);
    audio.play();

    audio.onended = () => {
      setPlayingAudioId(null);
    };

    audio.onerror = () => {
      setPlayingAudioId(null);
      error('Could not play the voice recording.');
    };
  };

  // Calculate progress
  const completedCount = todayRoutines.filter(isCompletedToday).length;
  const totalCount = todayRoutines.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="my-routines-container animate-fadeIn" data-mode="patient" id="patient-routines-page">
      <header className="patient-page-header">
        <button className="btn btn-secondary back-btn" onClick={() => navigate('/patient')} id="back-to-home">
          <FiArrowLeft /> Back
        </button>
        <h1 className="text-gradient">My Daily Routines</h1>
        <p className="page-subtitle">Simple activities to keep you going today</p>
      </header>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="progress-section card-glass animate-scaleIn">
          <div className="progress-stats">
            <h2>Today's Progress</h2>
            <span className="progress-text">
              {completedCount} of {totalCount} Completed
            </span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loader-container">
          <div className="loader-brain"></div>
          <p className="loader-text">Loading today's schedule...</p>
        </div>
      ) : todayRoutines.length === 0 ? (
        <div className="empty-state animate-scaleIn">
          <span className="empty-state-icon">🗓️</span>
          <h2 className="empty-state-title">No Routines Today</h2>
          <p className="empty-state-text">
            No routines are scheduled for today. Have a relaxing day or check back tomorrow!
          </p>
        </div>
      ) : (
        <div className="routines-list">
          {todayRoutines.map((routine, idx) => {
            const completed = isCompletedToday(routine);
            const categoryEmojis = {
              medication: '💊',
              meal: '🍽️',
              exercise: '🏃',
              hygiene: '🚿',
              other: '📋',
            };

            return (
              <div
                key={routine._id}
                className={`routine-card card animate-fadeInUp delay-${idx + 1} ${
                  completed ? 'completed' : 'active-routine'
                }`}
                id={`routine-${routine._id}`}
              >
                <div className="routine-left">
                  <div className="routine-category-emoji">
                    {categoryEmojis[routine.category] || '📋'}
                  </div>
                  <div className="routine-info">
                    <span className="routine-time">{formatTime(routine.scheduledTime)}</span>
                    <h2 className="routine-title">{routine.title}</h2>
                    {routine.description && <p className="routine-desc">{routine.description}</p>}
                  </div>
                </div>

                <div className="routine-actions">
                  {routine.audioFileId && !completed && (
                    <button
                      className={`btn btn-secondary voice-prompt-btn ${
                        playingAudioId === routine._id ? 'playing' : ''
                      }`}
                      onClick={() => playVoicePrompt(routine._id, routine.audioFileId)}
                      aria-label="Play caregiver voice prompt"
                      id={`play-voice-${routine._id}`}
                    >
                      <FiPlay /> {playingAudioId === routine._id ? 'Listening...' : 'Hear Voice'}
                    </button>
                  )}

                  {completed ? (
                    <div className="completed-badge">
                      <FiCheck /> Done
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary done-check-btn"
                      onClick={() => handleComplete(routine._id)}
                      id={`complete-btn-${routine._id}`}
                    >
                      Done ✓
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
