import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiAlertCircle, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Login.css';

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (response.data?.devResetUrl) {
        setDevResetUrl(response.data.devResetUrl);
      }
      toast.success('Reset link sent!');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset link. Please try again.';
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
            <h1 className="login-title">Reset Password</h1>
            <p className="login-subtitle">
              {submitted
                ? 'Check your inbox for instructions'
                : 'Enter your email to receive a password reset link'}
            </p>
          </header>

          {error && (
            <div className="login-error animate-fadeInDown" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
              <FiAlertCircle size={16} />
              {error}
            </div>
          )}

          {submitted ? (
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
                If an account exists for <strong>{email}</strong>, we have dispatched an email containing a secure link to reset your password.
              </p>

              {devResetUrl && (
                <div
                  style={{
                    background: '#F0FDFA',
                    border: '1px solid #99F6E4',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3)',
                    marginBottom: 'var(--space-4)',
                    fontSize: 'var(--text-xs)',
                    textAlign: 'left',
                    wordBreak: 'break-all',
                  }}
                >
                  <strong style={{ color: '#0F766E', display: 'block', marginBottom: '4px' }}>
                    🛠️ Development Reset Link:
                  </strong>
                  <a href={devResetUrl} style={{ color: '#0D9488', textDecoration: 'underline' }}>
                    {devResetUrl}
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSubmitted(false);
                    setDevResetUrl('');
                  }}
                  style={{ width: '100%' }}
                >
                  Try another email
                </button>
                <Link
                  to="/login"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--space-2)',
                    textDecoration: 'none',
                  }}
                >
                  <FiArrowLeft size={16} /> Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="reset-email">
                  Email Address
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    autoComplete="email"
                    required
                    aria-required="true"
                  />
                  <span className="login-input-icon" aria-hidden="true">
                    <FiMail size={18} />
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                id="forgot-submit"
                disabled={loading}
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
              >
                {loading ? <span className="btn-spinner" /> : 'Send Reset Link'}
              </button>
            </form>
          )}

          {!submitted && (
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
