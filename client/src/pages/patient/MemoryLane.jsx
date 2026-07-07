import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { memoryService, fileService } from '../../services/services';
import { formatDate } from '../../utils/helpers';
import { FiArrowLeft, FiImage, FiMusic, FiBookOpen } from 'react-icons/fi';
import './MemoryLane.css';

export default function MemoryLane() {
  const { user } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const patientId = user?.role === 'patient' ? user?._id : user?.linkedPatients?.[0];
        if (!patientId) {
          setLoading(false);
          return;
        }
        const { data } = await memoryService.getAll(patientId);
        setMemories(data?.data || []);
      } catch (err) {
        error('Could not load memories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, [user, error]);

  const filteredMemories = memories.filter((memory) => {
    if (filter === 'all') return true;
    return memory.type === filter;
  });

  return (
    <div className="memory-lane-container animate-fadeIn" data-mode="patient" id="patient-memory-lane">
      <header className="patient-page-header">
        <button className="btn btn-secondary back-btn" onClick={() => navigate('/patient')} id="back-to-home">
          <FiArrowLeft /> Back
        </button>
        <h1 className="text-gradient">My Memory Lane</h1>
        <p className="page-subtitle">A collection of beautiful moments shared with you</p>
      </header>

      {/* Filter Chips */}
      <div className="filter-chips">
        <button
          className={`chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
          id="filter-all"
        >
          ✨ All Memories
        </button>
        <button
          className={`chip ${filter === 'photo' ? 'active' : ''}`}
          onClick={() => setFilter('photo')}
          id="filter-photo"
        >
          🖼️ Photos
        </button>
        <button
          className={`chip ${filter === 'audio' ? 'active' : ''}`}
          onClick={() => setFilter('audio')}
          id="filter-audio"
        >
          🎵 Voices
        </button>
        <button
          className={`chip ${filter === 'story' ? 'active' : ''}`}
          onClick={() => setFilter('story')}
          id="filter-story"
        >
          📖 Stories
        </button>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="loader-brain"></div>
          <p className="loader-text">Opening your memory lane...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="empty-state animate-scaleIn">
          <span className="empty-state-icon">📸</span>
          <h2 className="empty-state-title">No Memories Yet</h2>
          <p className="empty-state-text">
            Your family hasn't uploaded any memories here yet. Ask them to share photos or voice clips!
          </p>
        </div>
      ) : (
        <div className="timeline-wrapper">
          <div className="timeline-line"></div>

          {filteredMemories.map((memory, idx) => {
            const isLeft = idx % 2 === 0;
            return (
              <div
                key={memory._id}
                className={`timeline-item animate-fadeInUp delay-${(idx % 6) + 1} ${
                  isLeft ? 'left' : 'right'
                }`}
              >
                <div className="timeline-marker animate-pulse"></div>

                <div className="memory-card card">
                  <div className="memory-card-header">
                    <span className="memory-type-badge">
                      {memory.type === 'photo' && '🖼️ Photo'}
                      {memory.type === 'audio' && '🎵 Voice'}
                      {memory.type === 'story' && '📖 Story'}
                    </span>
                    <span className="memory-date">{formatDate(memory.date)}</span>
                  </div>

                  <div className="memory-card-body">
                    {memory.type === 'photo' && memory.fileId && (
                      <div className="memory-image-container">
                        <img
                          src={fileService.getFileUrl(memory.fileId)}
                          alt={memory.title}
                          className="memory-image"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {memory.type === 'audio' && memory.fileId && (
                      <div className="memory-audio-container">
                        <div className="audio-icon-wrapper">
                          <FiMusic className="audio-wave-icon" />
                        </div>
                        <audio
                          controls
                          src={fileService.getFileUrl(memory.fileId)}
                          className="patient-audio-player"
                        ></audio>
                      </div>
                    )}

                    {memory.type === 'story' && (
                      <blockquote className="memory-story-quote">
                        "{memory.description}"
                      </blockquote>
                    )}

                    <h2 className="memory-title">{memory.title}</h2>
                    {memory.type !== 'story' && memory.description && (
                      <p className="memory-desc">{memory.description}</p>
                    )}

                    {memory.location && (
                      <span className="memory-location">📍 {memory.location}</span>
                    )}
                  </div>

                  <div className="memory-card-footer">
                    <span className="memory-uploader">
                      Shared by {memory.uploadedBy?.name || 'Family'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
