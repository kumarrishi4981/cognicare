import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await login(formData.email, formData.password);
      toast.success('Welcome back!');
      const role = data.data?.role || 'patient';
      navigate(role === 'caregiver' ? '/caregiver' : '/patient');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
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
            <h1 className="login-title">Sign In</h1>
            <p className="login-subtitle">Welcome back. Let&apos;s continue caring.</p>
          </header>

          {error && (
            <div className="login-error animate-fadeInDown" role="alert">
              <FiAlertCircle size={16} />
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div className="login-input-wrapper">
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  aria-required="true"
                />
                <span className="login-input-icon" aria-hidden="true">
                  <FiMail size={18} />
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="login-input-wrapper">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-remember-row">
              <label className="login-remember" htmlFor="login-remember">
                <input
                  id="login-remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="login-forgot" id="login-forgot-link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              id="login-submit"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? <span className="btn-spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className="login-register-link">
            Don&apos;t have an account?{' '}
            <Link to="/register" id="login-register-link">Sign up</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
