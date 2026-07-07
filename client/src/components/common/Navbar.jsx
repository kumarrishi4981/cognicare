import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/helpers';
import {
  FiHome, FiImage, FiClock, FiFileText,
  FiMessageSquare, FiUser, FiLogOut, FiSun, FiMoon, FiMenu, FiX
} from 'react-icons/fi';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/caregiver', label: 'Dashboard', icon: <FiHome /> },
    { path: '/caregiver/memories', label: 'Memories', icon: <FiImage /> },
    { path: '/caregiver/routines', label: 'Routines', icon: <FiClock /> },
    { path: '/caregiver/log', label: 'Daily Log', icon: <FiFileText /> },
    { path: '/caregiver/chat', label: 'Team Chat', icon: <FiMessageSquare /> },
    { path: '/caregiver/profile', label: 'Patient Profile', icon: <FiUser /> },
  ];

  return (
    <>
      <nav className="navbar" id="caregiver-navbar">
        <div className="navbar-inner">
          <div className="navbar-brand" onClick={() => navigate('/caregiver')}>
            <span className="navbar-logo">🧠</span>
            <span className="navbar-title">CogniCare</span>
          </div>

          <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/caregiver'}
                className={({ isActive }) =>
                  `navbar-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setMobileOpen(false)}
                id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="navbar-actions">
            <button
              className="navbar-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              id="theme-toggle"
            >
              {isDark ? <FiSun /> : <FiMoon />}
            </button>

            <div className="navbar-user">
              <div className="avatar avatar-placeholder navbar-avatar">
                {getInitials(user?.name)}
              </div>
              <span className="navbar-user-name">{user?.name}</span>
            </div>

            <button
              className="navbar-logout"
              onClick={handleLogout}
              aria-label="Logout"
              id="logout-btn"
            >
              <FiLogOut />
            </button>

            <button
              className="navbar-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </nav>
      {mobileOpen && (
        <div className="navbar-mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
