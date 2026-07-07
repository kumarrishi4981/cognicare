import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { companionService, fileService } from '../../services/services';
import { FiArrowLeft, FiPhone, FiUser } from 'react-icons/fi';
import './PatientFamily.css';

export default function PatientFamily() {
  const { user } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const patientId = user?.role === 'patient' ? user?._id : user?.linkedPatients?.[0];
        if (!patientId) {
          setLoading(false);
          return;
        }
        const { data } = await companionService.getProfile(patientId);
        setProfile(data?.data || null);
      } catch (err) {
        error('Could not load family profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <div className="patient-family-container animate-fadeIn" data-mode="patient" id="patient-family-page">
      <header className="patient-page-header">
        <button className="btn btn-secondary back-btn" onClick={() => navigate('/patient')} id="back-to-home">
          <FiArrowLeft /> Back
        </button>
        <h1 className="text-gradient">My Family & Contacts</h1>
        <p className="page-subtitle">Your loved ones and important contacts</p>
      </header>

      {loading ? (
        <div className="loader-container">
          <div className="loader-brain"></div>
          <p className="loader-text">Loading details...</p>
        </div>
      ) : !profile ? (
        <div className="empty-state animate-scaleIn">
          <span className="empty-state-icon">👨‍👩‍👧‍👦</span>
          <h2 className="empty-state-title">No Family Profile Yet</h2>
          <p className="empty-state-text">
            Your caregiver has not configured your patient profile yet. Once configured, you'll see your family list here!
          </p>
        </div>
      ) : (
        <div className="family-sections-grid">
          {/* Family Members Section */}
          <section className="family-section card animate-fadeInUp">
            <h2>❤️ Family Members</h2>
            {(!profile.familyMembers || profile.familyMembers.length === 0) ? (
              <p className="no-data">No family members registered yet.</p>
            ) : (
              <div className="family-list">
                {profile.familyMembers.map((member, idx) => (
                  <div key={idx} className="family-member-card card-interactive">
                    <div className="avatar-wrapper">
                      {member.photoFileId ? (
                        <img
                          src={fileService.getFileUrl(member.photoFileId)}
                          alt={member.name}
                          className="avatar avatar-xl"
                        />
                      ) : (
                        <div className="avatar avatar-xl avatar-placeholder">
                          <FiUser />
                        </div>
                      )}
                    </div>
                    <div className="family-member-info">
                      <h3>{member.name}</h3>
                      <span className="badge badge-primary">{member.relation}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Emergency Contacts Section */}
          <section className="family-section card animate-fadeInUp delay-2">
            <h2>🚨 Emergency Contacts</h2>
            {(!profile.emergencyContacts || profile.emergencyContacts.length === 0) ? (
              <p className="no-data">No emergency contacts registered yet.</p>
            ) : (
              <div className="contacts-list">
                {profile.emergencyContacts.map((contact, idx) => (
                  <div key={idx} className="contact-item card-interactive">
                    <div className="contact-header">
                      <h3>{contact.name}</h3>
                      <span className="badge badge-danger">{contact.relation}</span>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="btn btn-warm phone-link"
                      id={`call-contact-${idx}`}
                    >
                      <FiPhone /> {contact.phone}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Personal Key Facts Section */}
          <section className="family-section card animate-fadeInUp delay-3">
            <h2>💡 Facts About Me</h2>
            {(!profile.keyFacts || profile.keyFacts.length === 0) ? (
              <p className="no-data">No custom facts registered yet.</p>
            ) : (
              <ul className="facts-list">
                {profile.keyFacts.map((fact, idx) => (
                  <li key={idx} className="fact-item animate-scaleIn">
                    ✨ {fact}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
