import ServerStatusBanner from './components/common/ServerStatusBanner';
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages - lazy imports for production code-splitting
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const MemoryLane = lazy(() => import('./pages/patient/MemoryLane'));
const MyRoutines = lazy(() => import('./pages/patient/MyRoutines'));
const AICompanion = lazy(() => import('./pages/patient/AICompanion'));
const PatientFamily = lazy(() => import('./pages/patient/PatientFamily'));
const CaregiverDashboard = lazy(() => import('./pages/caregiver/CaregiverDashboard'));
const ManageMemories = lazy(() => import('./pages/caregiver/ManageMemories'));
const ManageRoutines = lazy(() => import('./pages/caregiver/ManageRoutines'));
const DailyLog = lazy(() => import('./pages/caregiver/DailyLog'));
const TeamChat = lazy(() => import('./pages/caregiver/TeamChat'));
const PatientProfilePage = lazy(() => import('./pages/caregiver/PatientProfilePage'));

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

      <ServerStatusBanner />
      <Suspense fallback={
        <div className="loader-container" style={{ minHeight: '100vh' }}>
          <div className="loader-brain" />
          <p className="loader-text">Loading...</p>
        </div>
      }>
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
          <Route
            path="/forgot-password"
            element={
              isAuthenticated ? (
                <Navigate to={user?.role === 'patient' ? '/patient' : '/caregiver'} replace />
              ) : (
                <ForgotPassword />
              )
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              isAuthenticated ? (
                <Navigate to={user?.role === 'patient' ? '/patient' : '/caregiver'} replace />
              ) : (
                <ResetPassword />
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
      </Suspense>
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
