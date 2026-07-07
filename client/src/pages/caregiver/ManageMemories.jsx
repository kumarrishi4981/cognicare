import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { memoryService, authService } from '../../services/services';
import { formatDate } from '../../utils/helpers';
import { FiPlus, FiTrash2, FiImage, FiMusic, FiBookOpen, FiX } from 'react-icons/fi';
import './ManageMemories.css';

export default function ManageMemories() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'photo', // 'photo', 'audio', 'story'
    date: new Date().toISOString().split('T')[0],
    location: '',
  });
  const [file, setFile] = useState(null);

  const fetchPatients = async () => {
    try {
      const { data } = await authService.getLinkedUsers();
      const linkedList = data?.data?.linkedUsers || [];
      setPatients(linkedList);
      if (linkedList.length > 0) {
        setSelectedPatientId(linkedList[0]._id);
      }
    } catch (err) {
      error('Failed to load linked patients.');
    }
  };

  const fetchMemories = async () => {
    if (!selectedPatientId) return;
    setLoading(true);
    try {
      const { data } = await memoryService.getAll(selectedPatientId);
      setMemories(data?.data || []);
    } catch (err) {
      error('Failed to load memories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [user]);

  useEffect(() => {
    fetchMemories();
  }, [selectedPatientId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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
      formPayload.append('type', formData.type);
      formPayload.append('date', formData.date);
      formPayload.append('location', formData.location);
      if (file) {
        formPayload.append('file', file);
      }

      await memoryService.create(formPayload);
      success('Memory uploaded successfully!');
      setShowModal(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'photo',
        date: new Date().toISOString().split('T')[0],
        location: '',
      });
      setFile(null);
      fetchMemories();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to upload memory.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
    try {
      await memoryService.delete(id);
      success('Memory deleted successfully.');
      fetchMemories();
    } catch (err) {
      error('Failed to delete memory.');
    }
  };

  return (
    <div className="manage-memories-container animate-fadeIn" id="manage-memories-page">
      <header className="caregiver-header-block">
        <div>
          <span className="badge badge-primary">Memories</span>
          <h1>Manage Memory Lane</h1>
        </div>
        {selectedPatientId && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-memory-btn">
            <FiPlus /> Add Memory
          </button>
        )}
      </header>

      {/* Patient Selector */}
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
          <p className="loader-text">Loading patient memories...</p>
        </div>
      ) : memories.length === 0 ? (
        <div className="empty-state card">
          <FiImage className="empty-state-icon" />
          <h2 className="empty-state-title">No Memories Yet</h2>
          <p className="empty-state-text">
            Upload photos, audio clips, or write stories to fill the patient's Memory Lane dashboard.
          </p>
        </div>
      ) : (
        <div className="memories-management-grid">
          {memories.map((memory) => (
            <div key={memory._id} className="memory-manage-card card">
              <div className="memory-card-top">
                <span className="badge badge-primary">
                  {memory.type === 'photo' && '🖼️ Photo'}
                  {memory.type === 'audio' && '🎵 Voice'}
                  {memory.type === 'story' && '📖 Story'}
                </span>
                <span className="date-label">{formatDate(memory.date)}</span>
              </div>
              <div className="memory-card-middle">
                <h3>{memory.title}</h3>
                {memory.description && <p>{memory.description}</p>}
                {memory.location && <span className="location-tag">📍 {memory.location}</span>}
              </div>
              <div className="memory-card-actions">
                <button
                  className="btn btn-danger btn-icon"
                  onClick={() => handleDelete(memory._id)}
                  aria-label="Delete memory"
                  id={`delete-mem-${memory._id}`}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Memory Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h2>Add New Memory</h2>
              <button className="modal-close" onClick={() => setShowModal(false)} id="close-modal-btn">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="mem-type">Memory Type</label>
                <select
                  id="mem-type"
                  name="type"
                  className="form-input"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="photo">🖼️ Photo File</option>
                  <option value="audio">🎵 Voice/Sound Recording</option>
                  <option value="story">📖 Written Story</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mem-title">Title</label>
                <input
                  type="text"
                  id="mem-title"
                  name="title"
                  className="form-input"
                  placeholder="e.g. Grandma's 80th Birthday Party"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              {formData.type === 'story' ? (
                <div className="form-group">
                  <label className="form-label" htmlFor="mem-desc">Write Story</label>
                  <textarea
                    id="mem-desc"
                    name="description"
                    className="form-input form-textarea"
                    placeholder="Type details about this memory..."
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="mem-file">Choose Media File</label>
                    <input
                      type="file"
                      id="mem-file"
                      className="form-input"
                      accept={formData.type === 'photo' ? 'image/*' : 'audio/*'}
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="mem-desc">Description (Optional)</label>
                    <textarea
                      id="mem-desc"
                      name="description"
                      className="form-input form-textarea"
                      placeholder="Add brief details for context..."
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              <div className="modal-form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="mem-date">Date of Memory</label>
                  <input
                    type="date"
                    id="mem-date"
                    name="date"
                    className="form-input"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="mem-location">Location (Optional)</label>
                  <input
                    type="text"
                    id="mem-location"
                    name="location"
                    className="form-input"
                    placeholder="e.g. New York City"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  id="cancel-upload"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading} id="submit-upload">
                  {modalLoading ? <div className="btn-spinner"></div> : 'Upload Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
