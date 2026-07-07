import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FiUser, FiMail, FiLock, FiArrowRight, FiArrowLeft, FiHeart, FiEye, FiEyeOff } from 'react-icons/fi';
import './Register.css';

export default function Register() {
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '', // 'patient' or 'caregiver'
    inviteCode: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: '' }));
    }
  };

  const validateStep1 = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Invalid email address';
    }
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateStep2 = () => {
    const tempErrors = {};
    if (!formData.role) {
      tempErrors.role = 'Please select a role';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 3) return;

    setLoading(true);
    try {
      await register(formData);
      success('Registration successful! Welcome to CogniCare.');
      if (formData.role === 'patient') {
        navigate('/patient');
      } else {
        navigate('/caregiver');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container animate-fadeIn" id="register-page">
      <div className="register-bg-decorations" aria-hidden="true">
        <div className="register-bubble register-bubble-1"></div>
        <div className="register-bubble register-bubble-2"></div>
        <div className="register-bubble register-bubble-3"></div>
      </div>
      <div className="register-card">
        <div className="register-header">
          <span className="register-logo">🧠</span>
          <h2>Join CogniCare</h2>
          <p>Let's set up your cognitive support ecosystem</p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>2</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* STEP 1: Basic Account Info */}
          {step === 1 && (
            <div className="form-step animate-fadeInUp">
              <div className="form-group">
                <label className="form-label" htmlFor="register-name">Full Name</label>
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    id="register-name"
                    name="name"
                    className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="register-email">Email Address</label>
                <div className="input-with-icon">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="register-password">Password</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="register-password"
                    name="password"
                    className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ paddingRight: 'calc(var(--space-4) + 24px)' }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="register-confirm-password">Confirm Password</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="register-confirm-password"
                    name="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{ paddingRight: 'calc(var(--space-4) + 24px)' }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>
            </div>
          )}

          {/* STEP 2: Role Selection */}
          {step === 2 && (
            <div className="form-step animate-fadeInUp">
              <label className="form-label centered-label">Select Your Role</label>
              <div className="role-cards-container">
                <div
                  className={`role-card ${formData.role === 'patient' ? 'selected' : ''}`}
                  onClick={() => handleRoleSelect('patient')}
                  id="role-patient-select"
                >
                  <div className="role-card-icon patient-icon">🧠</div>
                  <h3>I am a Patient</h3>
                  <p>Access direct visual aids, daily routines, and talk to your companion.</p>
                </div>

                <div
                  className={`role-card ${formData.role === 'caregiver' ? 'selected' : ''}`}
                  onClick={() => handleRoleSelect('caregiver')}
                  id="role-caregiver-select"
                >
                  <div className="role-card-icon caregiver-icon">❤️</div>
                  <h3>I am a Caregiver</h3>
                  <p>Add memories, manage routines, log updates, and coordinate care.</p>
                </div>
              </div>
              {errors.role && <span className="form-error centered-error">{errors.role}</span>}
            </div>
          )}

          {/* STEP 3: Setup & Finish */}
          {step === 3 && (
            <div className="form-step animate-fadeInUp">
              {formData.role === 'patient' ? (
                <div className="setup-welcome">
                  <div className="welcome-emoji">✨</div>
                  <h3>You're almost ready!</h3>
                  <p className="welcome-text">
                    Once you finish, we will generate your secure linking invite code. Share this code with your caregiver or family members so they can link with you.
                  </p>
                </div>
              ) : (
                <div className="setup-caregiver">
                  <h3>Link a Patient</h3>
                  <p className="setup-desc">
                    If you have your patient's 6-character invite code, enter it below. You can also skip this and link later from your dashboard.
                  </p>
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-invite-code">Invite Code (Optional)</label>
                    <input
                      type="text"
                      id="register-invite-code"
                      name="inviteCode"
                      className="form-input code-input"
                      placeholder="e.g. A9X8B2"
                      value={formData.inviteCode}
                      onChange={handleChange}
                      maxLength={6}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="register-actions">
            {step > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
                id="btn-back"
              >
                <FiArrowLeft /> Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
                style={{ marginLeft: step === 1 ? 'auto' : '0' }}
                id="btn-next"
              >
                Next <FiArrowRight />
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                id="btn-finish"
              >
                {loading ? <div className="btn-spinner"></div> : 'Finish Setup'}
              </button>
            )}
          </div>
        </form>

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login" id="link-login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
