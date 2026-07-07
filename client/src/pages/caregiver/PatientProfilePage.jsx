import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { companionService } from '../../services/services';
import { FiPlus, FiTrash, FiSave } from 'react-icons/fi';
import './PatientProfilePage.css';

export default function PatientProfilePage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Profile Form States
  const [preferredName, setPreferredName] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [keyFacts, setKeyFacts] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  // Fetch lists
  const fetchPatients = async () => {
    try {
      const { data } = await authService.getLinkedUsers();
      const linkedList = data?.data?.linkedUsers || [];
      setPatients(linkedList);
      if (linkedList.length > 0) {
        setSelectedPatientId(linkedList[0]._id);
      }
    } catch (err) {
      console.log('Error listing patients');
    }
  };

  const fetchProfile = async () => {
    if (!selectedPatientId) return;
    setProfileLoading(true);
    try {
      const { data } = await companionService.getProfile(selectedPatientId);
      const profileData = data?.data;
      if (profileData) {
        setPreferredName(profileData.preferredName || '');
        setHomeAddress(profileData.homeAddress || '');
        setFamilyMembers(profileData.familyMembers || []);
        setKeyFacts(profileData.keyFacts || []);
        setEmergencyContacts(profileData.emergencyContacts || []);
      }
    } catch (err) {
      error('Failed to load profile details.');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [selectedPatientId]);

  // Family dynamic rows
  const addFamilyMember = () => {
    setFamilyMembers((prev) => [...prev, { name: '', relation: '' }]);
  };

  const removeFamilyMember = (index) => {
    setFamilyMembers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleFamilyChange = (index, field, value) => {
    setFamilyMembers((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Facts dynamic list
  const addKeyFact = () => {
    setKeyFacts((prev) => [...prev, '']);
  };

  const removeKeyFact = (index) => {
    setKeyFacts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleFactChange = (index, value) => {
    setKeyFacts((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Emergency dynamic rows
  const addEmergencyContact = () => {
    setEmergencyContacts((prev) => [...prev, { name: '', phone: '', relation: '' }]);
  };

  const removeEmergencyContact = (index) => {
    setEmergencyContacts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleEmergencyChange = (index, field, value) => {
    setEmergencyContacts((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await companionService.updateProfile(selectedPatientId, {
        preferredName,
        homeAddress,
        familyMembers,
        keyFacts,
        emergencyContacts,
      });
      success('Patient context profile saved! Companion AI updated.');
    } catch (err) {
      error('Failed to update patient profile context.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="patient-profile-page-container animate-fadeIn" id="patient-profile-context-page">
      <header className="caregiver-header-block">
        <div>
          <span className="badge badge-primary">Context Configuration</span>
          <h1>AI Companion Context</h1>
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

      {profileLoading ? (
        <div className="loader-container">
          <div className="loader-brain"></div>
          <p className="loader-text">Loading profile context...</p>
        </div>
      ) : selectedPatientId ? (
        <form onSubmit={handleSave} className="profile-config-form">
          {/* Section 1: Basic details */}
          <div className="form-section card">
            <h2>Basic Context</h2>
            <div className="form-group">
              <label className="form-label" htmlFor="patient-preferred-name">Preferred Name / Nickname</label>
              <input
                type="text"
                id="patient-preferred-name"
                className="form-input"
                placeholder="e.g. Papa, Grandma Mary"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="patient-address">Home Address</label>
              <input
                type="text"
                id="patient-address"
                className="form-input"
                placeholder="e.g. 123 Maple Street, Springfield"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Family members */}
          <div className="form-section card">
            <div className="section-header-row">
              <h2>Family Members</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addFamilyMember} id="add-family-member-row">
                <FiPlus /> Add Member
              </button>
            </div>
            {familyMembers.length === 0 ? (
              <p className="no-data">No family members added. Add them to help the AI remember relationships.</p>
            ) : (
              <div className="dynamic-rows-list">
                {familyMembers.map((member, index) => (
                  <div key={index} className="dynamic-row">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Name (e.g. Sarah)"
                      value={member.name}
                      onChange={(e) => handleFamilyChange(index, 'name', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Relation (e.g. Daughter)"
                      value={member.relation}
                      onChange={(e) => handleFamilyChange(index, 'relation', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      onClick={() => removeFamilyMember(index)}
                      id={`remove-fam-${index}`}
                    >
                      <FiTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Facts */}
          <div className="form-section card">
            <div className="section-header-row">
              <h2>Facts & History</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addKeyFact} id="add-fact-row">
                <FiPlus /> Add Fact
              </button>
            </div>
            {keyFacts.length === 0 ? (
              <p className="no-data">No history facts added. Add facts like "Retired school teacher" or "Loves roses".</p>
            ) : (
              <div className="dynamic-rows-list">
                {keyFacts.map((fact, index) => (
                  <div key={index} className="dynamic-row">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Retired from teaching in 1998"
                      value={fact}
                      onChange={(e) => handleFactChange(index, e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      onClick={() => removeKeyFact(index)}
                      id={`remove-fact-${index}`}
                    >
                      <FiTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Emergency */}
          <div className="form-section card">
            <div className="section-header-row">
              <h2>Emergency Contacts</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addEmergencyContact} id="add-emergency-contact-row">
                <FiPlus /> Add Contact
              </button>
            </div>
            {emergencyContacts.length === 0 ? (
              <p className="no-data">No emergency contacts logged yet.</p>
            ) : (
              <div className="dynamic-rows-list">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="dynamic-row">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contact Name"
                      value={contact.name}
                      onChange={(e) => handleEmergencyChange(index, 'name', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Relation"
                      value={contact.relation}
                      onChange={(e) => handleEmergencyChange(index, 'relation', e.target.value)}
                      required
                    />
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Phone Number"
                      value={contact.phone}
                      onChange={(e) => handleEmergencyChange(index, 'phone', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      onClick={() => removeEmergencyContact(index)}
                      id={`remove-emergency-${index}`}
                    >
                      <FiTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions-row">
            <button type="submit" className="btn btn-primary btn-lg" disabled={saveLoading} id="save-profile-btn">
              {saveLoading ? <div className="btn-spinner"></div> : <><FiSave /> Save Configuration</>}
            </button>
          </div>
        </form>
      ) : (
        <div className="empty-state card">
          <p>Link with a patient first to configure their AI context profile.</p>
        </div>
      )}
    </div>
  );
}

// Simple auth link fetcher patch
import { authService as localAuth } from '../../services/services';
const authService = localAuth;
