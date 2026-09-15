import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiLock, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Login.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      const message = err.response?.data?.message || 'Password reset failed. The link may be expired or invalid.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ── Branding Panel ──────────────────────────── */}
      <aside className="login-brand" aria-hidden="true">
        <div className="login-brand-shapes">
          <div className="login-brand-shape" />
          <div className="login-brand-shape" />
          <div className="login-brand-shape" />
        </div>
        <div className="login-brand-content animate-fadeInUp">
          <div className="login-brand-icon">🧠</div>
          <h2 className="login-brand-title">Welcome to CogniCare</h2>
          <p className="login-brand-subtitle">
            A compassionate ecosystem for dementia patients and their caregivers. Together, we make every day brighter.
          </p>
        </div>
      </aside>

      {/* ── Form Panel ─────────────────────────────── */}
      <main className="login-form-panel">
        <div className="login-bg-decorations" aria-hidden="true">
          <div className="login-bubble login-bubble-1"></div>
          <div className="login-bubble login-bubble-2"></div>
        </div>
        <div className="login-card animate-fadeIn">
          <header className="login-header">
            <h1 className="login-title">Set New Password</h1>
            <p className="login-subtitle">
              {isSuccess
                ? 'Your password has been updated'
                : 'Choose a strong password with at least 6 characters'}
            </p>
          </header>

          {error && (
            <div className="login-error animate-fadeInDown" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
              <FiAlertCircle size={16} />
              {error}
            </div>
          )}

          {isSuccess ? (
            <div className="animate-fadeIn" style={{ textAlign: 'center', padding: 'var(--space-2) 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(13, 148, 136, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-4) auto',
                  color: '#0D9488',
                }}
              >
                <FiCheckCircle size={36} />
              </div>

              <p style={{ color: '#4A5759', fontSize: 'var(--text-base)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
                Your password has been successfully reset! You can now log in to CogniCare with your new credentials.
              </p>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/login')}
                style={{ width: '100%' }}
              >
                Sign In Now
              </button>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">
                  New Password
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="new-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter new password (min. 6 characters)"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    style={{ paddingRight: 'calc(var(--space-4) + 24px)' }}
                  />
                  <span className="login-input-icon" aria-hidden="true">
                    <FiLock size={18} />
                  </span>
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    style={{ paddingRight: 'calc(var(--space-4) + 24px)' }}
                  />
                  <span className="login-input-icon" aria-hidden="true">
                    <FiLock size={18} />
                  </span>
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                id="reset-submit"
                disabled={loading}
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
              >
                {loading ? <span className="btn-spinner" /> : 'Update Password'}
              </button>
            </form>
          )}

          {!isSuccess && (
            <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-sm)',
                  color: '#0D9488',
                  fontWeight: 'var(--weight-semibold)',
                  textDecoration: 'none',
                }}
              >
                <FiArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
