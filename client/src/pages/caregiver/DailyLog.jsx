import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { logService, authService } from '../../services/services';
import { moodEmojis } from '../../utils/helpers';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FiPlus, FiTrendingUp } from 'react-icons/fi';
import './DailyLog.css';

export default function DailyLog() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [activeTab, setActiveTab] = useState('log'); // 'log' or 'trends'

  // Log Form State
  const [moodRating, setMoodRating] = useState(3);
  const [medicationAdherence, setMedicationAdherence] = useState(true);
  const [mealsConsumed, setMealsConsumed] = useState(3);
  const [sleepHours, setSleepHours] = useState(8);
  const [cognitiveNotes, setCognitiveNotes] = useState('');
  const [physicalNotes, setPhysicalNotes] = useState('');
  const [incidentNotes, setIncidentNotes] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Trends State
  const [trendData, setTrendData] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(false);

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

  const fetchTrends = async () => {
    if (!selectedPatientId || activeTab !== 'trends') return;
    setTrendsLoading(true);
    try {
      const { data } = await logService.getTrends(selectedPatientId);
      // Clean dates for charts
      const formatted = (data?.data?.trends || []).map((item) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));
      setTrendData(formatted);
    } catch (err) {
      error('Failed to load logs trends.');
    } finally {
      setTrendsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [user]);

  useEffect(() => {
    fetchTrends();
  }, [selectedPatientId, activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await logService.create({
        patientId: selectedPatientId,
        moodRating,
        medicationAdherence,
        mealsConsumed,
        sleepHours,
        cognitiveNotes,
        physicalNotes,
        incidentNotes,
      });

      success('Daily health log saved successfully!');
      
      // Reset form
      setMoodRating(3);
      setMedicationAdherence(true);
      setMealsConsumed(3);
      setSleepHours(8);
      setCognitiveNotes('');
      setPhysicalNotes('');
      setIncidentNotes('');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit daily log.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="daily-log-container animate-fadeIn" id="daily-log-page">
      <header className="caregiver-header-block">
        <div>
          <span className="badge badge-primary">Daily Tracker</span>
          <h1>Daily Health Log</h1>
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

      {/* Tabs */}
      <div className="log-tab-row">
        <button
          className={`tab-link ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveTab('log')}
          id="tab-new-log"
        >
          <FiPlus /> New Log Entry
        </button>
        <button
          className={`tab-link ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
          id="tab-trends"
        >
          <FiTrendingUp /> View Patient Trends
        </button>
      </div>

      {/* Content */}
      {selectedPatientId && activeTab === 'log' && (
        <form onSubmit={handleSubmit} className="daily-log-form card">
          <div className="form-sections-grid">
            {/* Left Column */}
            <div className="form-col">
              <div className="form-group">
                <label className="form-label">How is the Patient's Mood Today?</label>
                <div className="mood-selection-row">
                  {Object.entries(moodEmojis).map(([val, { emoji, label }]) => (
                    <button
                      key={val}
                      type="button"
                      className={`mood-emoji-btn ${moodRating === parseInt(val) ? 'selected' : ''}`}
                      onClick={() => setMoodRating(parseInt(val))}
                      title={label}
                      id={`mood-btn-${val}`}
                    >
                      <span className="emoji">{emoji}</span>
                      <span className="label">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group inline-toggle-group">
                <label className="form-label">Took Medications?</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="med-switch"
                    checked={medicationAdherence}
                    onChange={(e) => setMedicationAdherence(e.target.checked)}
                  />
                  <label htmlFor="med-switch" className="switch-label"></label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="meals-input">Meals Consumed Today: {mealsConsumed}</label>
                <input
                  type="range"
                  id="meals-input"
                  min="0"
                  max="5"
                  className="range-slider"
                  value={mealsConsumed}
                  onChange={(e) => setMealsConsumed(parseInt(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sleep-input">Sleep Hours Last Night: {sleepHours} hrs</label>
                <input
                  type="range"
                  id="sleep-input"
                  min="0"
                  max="16"
                  className="range-slider"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="form-col">
              <div className="form-group">
                <label className="form-label" htmlFor="notes-cog">Cognitive Status Notes</label>
                <textarea
                  id="notes-cog"
                  className="form-input form-textarea"
                  placeholder="e.g. Any confusion, memory repeats, general awareness details..."
                  value={cognitiveNotes}
                  onChange={(e) => setCognitiveNotes(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notes-phy">Physical Health Notes</label>
                <textarea
                  id="notes-phy"
                  className="form-input form-textarea"
                  placeholder="e.g. Energy levels, stability walking, appetite observations..."
                  value={physicalNotes}
                  onChange={(e) => setPhysicalNotes(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notes-inc">Behavioral Incidents (Optional)</label>
                <textarea
                  id="notes-inc"
                  className="form-input form-textarea"
                  placeholder="e.g. Aggression, wandering alerts, sleep disturbances..."
                  value={incidentNotes}
                  onChange={(e) => setIncidentNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-actions-row">
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitLoading} id="submit-log-btn">
              {submitLoading ? <div className="btn-spinner"></div> : 'Save Today\'s Entry'}
            </button>
          </div>
        </form>
      )}

      {selectedPatientId && activeTab === 'trends' && (
        <div className="trends-view-container">
          {trendsLoading ? (
            <div className="loader-container">
              <div className="loader-brain"></div>
              <p className="loader-text">Compiling trend charts...</p>
            </div>
          ) : trendData.length === 0 ? (
            <div className="empty-state card">
              <FiTrendingUp className="empty-state-icon" />
              <h2 className="empty-state-title">No Logs to Analyze</h2>
              <p className="empty-state-text">
                Submit daily logs for a few days to view cognitive charts and sleep analytics.
              </p>
            </div>
          ) : (
            <div className="charts-vertical-grid">
              {/* Mood Chart */}
              <div className="chart-card card">
                <h2>Mood Trajectory (Last 30 Days)</h2>
                <div className="recharts-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <XAxis dataKey="date" stroke="var(--color-text-muted)" />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="var(--color-text-muted)" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="moodRating"
                        stroke="var(--color-accent)"
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sleep Chart */}
              <div className="chart-card card">
                <h2>Sleep Trends (Hours Per Night)</h2>
                <div className="recharts-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trendData}>
                      <XAxis dataKey="date" stroke="var(--color-text-muted)" />
                      <YAxis stroke="var(--color-text-muted)" />
                      <Tooltip />
                      <Bar dataKey="sleepHours" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
