import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { routineService, authService } from '../../services/services';
import { formatTime } from '../../utils/helpers';
import { FiPlus, FiTrash2, FiClock, FiPlay, FiMic, FiSquare, FiX } from 'react-icons/fi';
import './ManageRoutines.css';

export default function ManageRoutines() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other', // 'medication', 'meal', 'exercise', 'hygiene', 'other'
    scheduledTime: '08:00',
    repeatDays: [], // e.g. ['Mon', 'Tue']
  });

  // Audio Recording State
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

  const fetchRoutines = async () => {
    if (!selectedPatientId) return;
    setLoading(true);
    try {
      const { data } = await routineService.getAll(selectedPatientId);
      setRoutines(data?.data || []);
    } catch (err) {
      error('Failed to load routines.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [user]);

  useEffect(() => {
    fetchRoutines();
  }, [selectedPatientId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const exists = prev.repeatDays.includes(day);
      const newDays = exists
        ? prev.repeatDays.filter((d) => d !== day)
        : [...prev.repeatDays, day];
      return { ...prev, repeatDays: newDays };
    });
  };

  // Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      error('Microphone access denied or error starting recording.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      // stop stream tracks to release microphone
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      error('Title is required.');
      return;
    }

    setModalLoading(true);
    try {
      const formPayload = new FormData();
      formPayload.append('patientId', selectedPatientId);
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      formPayload.append('category', formData.category);
      formPayload.append('scheduledTime', formData.scheduledTime);
      formData.repeatDays.forEach((day) => formPayload.append('repeatDays', day));

      if (audioBlob) {
        formPayload.append('audio', audioBlob, 'prompt.webm');
      }

      await routineService.create(formPayload);
      success('Routine created successfully!');
      setShowModal(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'other',
        scheduledTime: '08:00',
        repeatDays: [],
      });
      setAudioBlob(null);
      setAudioUrl('');
      fetchRoutines();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create routine.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this routine?')) return;
    try {
      await routineService.delete(id);
      success('Routine deleted.');
      fetchRoutines();
    } catch (err) {
      error('Failed to delete routine.');
    }
  };

  return (
    <div className="manage-routines-container animate-fadeIn" id="manage-routines-page">
      <header className="caregiver-header-block">
        <div>
          <span className="badge badge-primary">Routines</span>
          <h1>Manage Routines</h1>
        </div>
        {selectedPatientId && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-routine-btn">
            <FiPlus /> Create Routine
          </button>
        )}
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

      {loading ? (
        <div className="loader-container">
          <div className="loader-brain"></div>
          <p className="loader-text">Loading routines...</p>
        </div>
      ) : routines.length === 0 ? (
        <div className="empty-state card">
          <FiClock className="empty-state-icon" />
          <h2 className="empty-state-title">No Routines Set Up</h2>
          <p className="empty-state-text">
            Add task routines like medication checks, meals, or hygiene walks to organize the patient's day.
          </p>
        </div>
      ) : (
        <div className="routines-management-list">
          {routines.map((routine) => (
            <div key={routine._id} className="routine-manage-card card">
              <div className="routine-manage-left">
                <span className="routine-icon-badge">⏰</span>
                <div>
                  <h3>{routine.title}</h3>
                  <span className="time-badge">{formatTime(routine.scheduledTime)}</span>
                  <div className="repeat-days-row">
                    {daysOfWeek.map((day) => {
                      const active = routine.repeatDays.includes(day);
                      return (
                        <span key={day} className={`day-tag ${active ? 'active' : ''}`}>
                          {day[0]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="routine-manage-right">
                <button
                  className="btn btn-danger btn-icon"
                  onClick={() => handleDelete(routine._id)}
                  aria-label="Delete routine"
                  id={`delete-routine-${routine._id}`}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h2>Create Routine</h2>
              <button className="modal-close" onClick={() => setShowModal(false)} id="close-modal-btn">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="routine-title">Routine Title</label>
                <input
                  type="text"
                  id="routine-title"
                  name="title"
                  className="form-input"
                  placeholder="e.g. Morning Blood Pressure Medication"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="routine-time">Time</label>
                  <input
                    type="time"
                    id="routine-time"
                    name="scheduledTime"
                    className="form-input"
                    value={formData.scheduledTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="routine-category">Category</label>
                  <select
                    id="routine-category"
                    name="category"
                    className="form-input"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="medication">💊 Medication</option>
                    <option value="meal">🍽️ Meal</option>
                    <option value="exercise">🏃 Exercise</option>
                    <option value="hygiene">🚿 Hygiene</option>
                    <option value="other">📋 Other</option>
                  </select>
                </div>
              </div>

              {/* Repeat Days Selection */}
              <div className="form-group">
                <label className="form-label">Repeat Days</label>
                <div className="days-toggle-row">
                  {daysOfWeek.map((day) => {
                    const selected = formData.repeatDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`day-toggle-btn ${selected ? 'selected' : ''}`}
                        onClick={() => toggleDay(day)}
                        id={`toggle-day-${day}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Voice Recording Widget */}
              <div className="form-group">
                <label className="form-label">Caregiver Voice Prompt (Voice Reminder)</label>
                <div className="voice-record-widget">
                  {recording ? (
                    <button
                      type="button"
                      className="btn btn-danger recording-pulse"
                      onClick={stopRecording}
                      id="stop-rec-btn"
                    >
                      <FiSquare /> Stop Recording
                    </button>
                  ) : (
                    <button type="button" className="btn btn-secondary" onClick={startRecording} id="start-rec-btn">
                      <FiMic /> Start Recording
                    </button>
                  )}
                  {audioUrl && (
                    <div className="audio-preview-row">
                      <audio src={audioUrl} controls className="audio-preview-player" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="routine-desc">Instructions (Optional)</label>
                <textarea
                  id="routine-desc"
                  name="description"
                  className="form-input form-textarea"
                  placeholder="e.g. Take the blue capsule from the side table with water."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  id="cancel-create"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading} id="submit-create">
                  {modalLoading ? <div className="btn-spinner"></div> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
