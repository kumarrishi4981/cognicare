import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiHome, FiClock, FiMessageCircle, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import './PatientNav.css';

export default function PatientNav() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Top bar — minimal */}
      <header className="patient-topbar" id="patient-topbar">
        <div className="patient-topbar-inner">
          <div className="patient-topbar-brand">
            <span className="patient-topbar-logo">🧠</span>
            <span className="patient-topbar-title">CogniCare</span>
          </div>
          <div className="patient-topbar-actions">
            <button
              className="patient-topbar-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              id="patient-theme-toggle"
            >
              {isDark ? <FiSun /> : <FiMoon />}
            </button>
            <button
              className="patient-topbar-btn"
              onClick={handleLogout}
              aria-label="Logout"
              id="patient-logout-btn"
            >
              <FiLogOut />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom navigation — large touch targets */}
      <nav className="patient-bottom-nav" id="patient-bottom-nav">
        <NavLink
          to="/patient"
          end
          className={({ isActive }) => `patient-nav-item ${isActive ? 'active' : ''}`}
          id="patient-nav-home"
        >
          <FiHome />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/patient/routines"
          className={({ isActive }) => `patient-nav-item ${isActive ? 'active' : ''}`}
          id="patient-nav-routines"
        >
          <FiClock />
          <span>Routines</span>
        </NavLink>
        <NavLink
          to="/patient/companion"
          className={({ isActive }) => `patient-nav-item ${isActive ? 'active' : ''}`}
          id="patient-nav-companion"
        >
          <FiMessageCircle />
          <span>Chat</span>
        </NavLink>
      </nav>
    </>
  );
}
