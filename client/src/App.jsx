import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages - lazy imports would be used in production, direct imports for simplicity
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PatientDashboard from './pages/patient/PatientDashboard';
import MemoryLane from './pages/patient/MemoryLane';
import MyRoutines from './pages/patient/MyRoutines';
import AICompanion from './pages/patient/AICompanion';
import PatientFamily from './pages/patient/PatientFamily';
import CaregiverDashboard from './pages/caregiver/CaregiverDashboard';
import ManageMemories from './pages/caregiver/ManageMemories';
import ManageRoutines from './pages/caregiver/ManageRoutines';
import DailyLog from './pages/caregiver/DailyLog';
import TeamChat from './pages/caregiver/TeamChat';
import PatientProfilePage from './pages/caregiver/PatientProfilePage';

// Layout components
import Navbar from './components/common/Navbar';
import PatientNav from './components/common/PatientNav';

function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { setPatientMode, setCaregiverMode } = useTheme();

  if (isLoading) {
    return (
      <div className="loader-container" style={{ minHeight: '100vh' }}>
        <div className="loader-brain" />
        <p className="loader-text">Loading CogniCare...</p>
      </div>
    );
  }

  return (
    <>
      {/* Show appropriate nav based on role */}
      {isAuthenticated && user?.role === 'caregiver' && <Navbar />}
      {isAuthenticated && user?.role === 'patient' && <PatientNav />}

      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'patient' ? '/patient' : '/caregiver'} replace />
            ) : (
              <Landing />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'patient' ? '/patient' : '/caregiver'} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'patient' ? '/patient' : '/caregiver'} replace />
            ) : (
              <Register />
            )
          }
        />

        {/* Patient Routes */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute roles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/memories"
          element={
            <ProtectedRoute roles={['patient']}>
              <MemoryLane />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/routines"
          element={
            <ProtectedRoute roles={['patient']}>
              <MyRoutines />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/companion"
          element={
            <ProtectedRoute roles={['patient']}>
              <AICompanion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/family"
          element={
            <ProtectedRoute roles={['patient']}>
              <PatientFamily />
            </ProtectedRoute>
          }
        />

        {/* Caregiver Routes */}
        <Route
          path="/caregiver"
          element={
            <ProtectedRoute roles={['caregiver']}>
              <CaregiverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/caregiver/memories"
          element={
            <ProtectedRoute roles={['caregiver']}>
              <ManageMemories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/caregiver/routines"
          element={
            <ProtectedRoute roles={['caregiver']}>
              <ManageRoutines />
            </ProtectedRoute>
          }
        />
        <Route
          path="/caregiver/log"
          element={
            <ProtectedRoute roles={['caregiver']}>
              <DailyLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/caregiver/chat"
          element={
            <ProtectedRoute roles={['caregiver']}>
              <TeamChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/caregiver/profile"
          element={
            <ProtectedRoute roles={['caregiver']}>
              <PatientProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  ) : (
    <AppContent />
  );
}
