import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService, logService, routineService, memoryService } from '../../services/services';
import { getGreeting } from '../../utils/helpers';
import {
  FiUsers, FiImage, FiClock, FiPlusCircle,
  FiFileText, FiMessageSquare, FiCopy, FiTrendingUp
} from 'react-icons/fi';
import './CaregiverDashboard.css';

export default function CaregiverDashboard() {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [linkedPatients, setLinkedPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    moodToday: 'No Log',
    routinesCount: '0/0',
    memoriesCount: 0,
    logsCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchLinkedUsers = async () => {
    try {
      const { data } = await authService.getLinkedUsers();
      const linkedList = data?.data?.linkedUsers || [];
      setLinkedPatients(linkedList);
      if (linkedList.length > 0) {
        setSelectedPatientId(linkedList[0]._id);
      }
    } catch (err) {
      error('Failed to load linked patients.');
    }
  };

  useEffect(() => {
    fetchLinkedUsers();
  }, [user]);

  // Load stats when selectedPatientId changes
  useEffect(() => {
    if (!selectedPatientId) return;

    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // Fetch memories count
        const { data: memData } = await memoryService.getAll(selectedPatientId);
        // Fetch routines count
        const { data: rotData } = await routineService.getAll(selectedPatientId);
        // Fetch daily logs to compute count and today's mood
        const { data: logData } = await logService.getAll(selectedPatientId);

        const todayString = new Date().toDateString();
        const routinesList = rotData?.data || [];
        const memoriesList = memData?.data || [];
        const logsList = logData?.data || [];

        const todayRoutines = routinesList.filter(r => {
          if (!r.isActive) return false;
          // default to true if repeatDays empty
          if (!r.repeatDays || r.repeatDays.length === 0) return true;
          return r.repeatDays.includes(new Date().toLocaleDateString('en-US', { weekday: 'short' }));
        });
        const completedRoutines = todayRoutines.filter(r => 
          r.completionLog && r.completionLog.some(log => new Date(log.date).toDateString() === todayString)
        );

        const latestLog = logsList[0];
        const moodEmojis = { 1: '😢', 2: '😟', 3: '😐', 4: '🙂', 5: '😊' };
        const moodText = latestLog && new Date(latestLog.date).toDateString() === todayString
          ? `${moodEmojis[latestLog.moodRating]} (${latestLog.moodRating}/5)`
          : 'No Log';

        setDashboardStats({
          moodToday: moodText,
          routinesCount: `${completedRoutines.length}/${todayRoutines.length}`,
          memoriesCount: memoriesList.length,
          logsCount: logsList.length,
        });
      } catch (err) {
        console.log('Error loading stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [selectedPatientId]);

  const handleLinkPatient = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLinkLoading(true);
    try {
      const { data } = await authService.linkCaregiver(inviteCode);
      success('Successfully linked with patient!');
      setInviteCode('');
      
      // Fetch updated caregiver details and update user context
      const { data: meRes } = await authService.getMe();
      updateUser(meRes.data);
      fetchLinkedUsers();
    } catch (err) {
      error(err.response?.data?.message || 'Link failed. Check code.');
    } finally {
      setLinkLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    success('Code copied to clipboard!');
  };

  const selectedPatient = linkedPatients.find((p) => p._id === selectedPatientId);

  return (
    <div className="caregiver-dashboard-container animate-fadeIn" id="caregiver-dashboard">
      <header className="caregiver-header-block">
        <div>
          <span className="badge badge-primary">Caregiver Panel</span>
          <h1 className="text-gradient">{getGreeting()}, {user?.name}!</h1>
        </div>
      </header>

      {linkedPatients.length === 0 ? (
        <div className="link-patient-prompt card animate-scaleIn">
          <FiUsers className="prompt-icon" />
          <h2>Link to Your Patient</h2>
          <p>
            Enter the 6-character Invite Code generated on your patient's dashboard to link accounts and start managing their care.
          </p>
          <form onSubmit={handleLinkPatient} className="link-form">
            <input
              type="text"
              placeholder="e.g. A8X9B3"
              className="form-input code-input"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={6}
              id="patient-link-code"
            />
            <button type="submit" className="btn btn-primary" disabled={linkLoading} id="patient-link-submit">
              {linkLoading ? <div className="btn-spinner"></div> : 'Link Patient'}
            </button>
          </form>
        </div>
      ) : (
        <div className="caregiver-layout-grid">
          {/* Main Panel */}
          <div className="caregiver-main-panel">
            {/* Patient Selector Tabs */}
            {linkedPatients.length > 1 && (
              <div className="patient-selector-tabs">
                {linkedPatients.map((patient) => (
                  <button
                    key={patient._id}
                    className={`tab-btn ${selectedPatientId === patient._id ? 'active' : ''}`}
                    onClick={() => setSelectedPatientId(patient._id)}
                  >
                    👤 {patient.name}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="dashboard-stats-grid">
              <div className="stat-card card">
                <span className="stat-icon mood-icon">😊</span>
                <div className="stat-info">
                  <h3>Today's Mood</h3>
                  <p>{loadingStats ? 'Loading...' : dashboardStats.moodToday}</p>
                </div>
              </div>
              <div className="stat-card card">
                <span className="stat-icon routines-icon">⏰</span>
                <div className="stat-info">
                  <h3>Routines Done</h3>
                  <p>{loadingStats ? 'Loading...' : dashboardStats.routinesCount}</p>
                </div>
              </div>
              <div className="stat-card card">
                <span className="stat-icon memories-icon">🖼️</span>
                <div className="stat-info">
                  <h3>Total Memories</h3>
                  <p>{loadingStats ? 'Loading...' : dashboardStats.memoriesCount}</p>
                </div>
              </div>
              <div className="stat-card card">
                <span className="stat-icon logs-icon">📝</span>
                <div className="stat-info">
                  <h3>Total Logs</h3>
                  <p>{loadingStats ? 'Loading...' : dashboardStats.logsCount}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="quick-actions-panel card">
              <h2>Quick Actions</h2>
              <div className="actions-buttons-grid">
                <button className="action-btn card-interactive" onClick={() => navigate('/caregiver/memories')} id="action-memories">
                  <FiPlusCircle className="action-icon" />
                  <span>Add Memory</span>
                </button>
                <button className="action-btn card-interactive" onClick={() => navigate('/caregiver/routines')} id="action-routines">
                  <FiClock className="action-icon" />
                  <span>New Routine</span>
                </button>
                <button className="action-btn card-interactive" onClick={() => navigate('/caregiver/log')} id="action-log">
                  <FiFileText className="action-icon" />
                  <span>Log Status</span>
                </button>
                <button className="action-btn card-interactive" onClick={() => navigate('/caregiver/chat')} id="action-chat">
                  <FiMessageSquare className="action-icon" />
                  <span>Team Chat</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Panel */}
          <aside className="caregiver-sidebar-panel">
            {selectedPatient && (
              <div className="patient-context-card card">
                <h2>Patient Linked Details</h2>
                <div className="patient-profile-summary">
                  <div className="avatar avatar-xl avatar-placeholder">
                    {selectedPatient.name[0].toUpperCase()}
                  </div>
                  <h3>{selectedPatient.name}</h3>
                  <p>{selectedPatient.email}</p>
                </div>
                <div className="invite-code-box">
                  <span>Invite Link Code</span>
                  <div className="code-display-row">
                    <span className="invite-code-val">{selectedPatient.inviteCode}</span>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => copyToClipboard(selectedPatient.inviteCode)}
                      aria-label="Copy code"
                      id="copy-code-btn"
                    >
                      <FiCopy />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
