import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Layouts
import InstitutionLayout from './layouts/InstitutionLayout';
import OfficialLayout from './layouts/OfficialLayout';
import AdminLayout from './layouts/AdminLayout';

// Institution Pages
import InstitutionDashboard from './pages/institution/Dashboard';
import NewApplication from './pages/institution/NewApplication';
import ApplicationDetails from './pages/institution/ApplicationDetails';
import InstitutionNotifications from './pages/institution/Notifications';
import InstitutionVerificationGate from './pages/institution/InstitutionVerificationGate';

// Official Pages
import ReviewApplication from './pages/official/ReviewApplication';
import InstitutionVerifications from './pages/official/InstitutionVerifications';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import RuleManagement from './pages/admin/RuleManagement';

function AppContent() {
  const { user, updateUser, logout } = useAuth();
  const [unauthView, setUnauthView] = useState('landing'); // 'landing' | 'login' | 'register'
  const [initialPortal, setInitialPortal] = useState('institution');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeAppId, setActiveAppId] = useState(null);

  // If unauthenticated: render public Landing, Login or Register
  if (!user) {
    if (unauthView === 'register') {
      return (
        <Register
          onBackToLogin={() => setUnauthView('login')}
          onCompleteRegistration={() => setUnauthView('login')}
        />
      );
    }

    if (unauthView === 'login') {
      return (
        <Login
          initialPortal={initialPortal}
          onNavigateHome={() => setUnauthView('landing')}
          onNavigateRegister={() => setUnauthView('register')}
          onLoginSuccess={() => setActiveTab('dashboard')}
        />
      );
    }

    // Default: Public Landing Page
    return (
      <LandingPage
        onSelectAction={(action) => {
          if (action === 'register') {
            setUnauthView('register');
          } else if (action === 'official-login') {
            setInitialPortal('official');
            setUnauthView('login');
          } else if (action === 'admin-login') {
            setInitialPortal('admin');
            setUnauthView('login');
          } else {
            setInitialPortal('institution');
            setUnauthView('login');
          }
        }}
      />
    );
  }

  const role = user.role === 'institution_user' ? 'institution' : user.role;

  // 1. Institution User Flow
  if (role === 'institution') {
    // Check if institution verification is required
    const isVerified = user.institution?.verification_status === 'verified';
    if (!isVerified && user.institution) {
      return (
        <InstitutionVerificationGate
          onVerified={() => {
            updateUser({
              institution: { ...user.institution, verification_status: 'verified' }
            });
            setActiveTab('dashboard');
          }}
          onLogout={logout}
        />
      );
    }

    return (
      <InstitutionLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeAppId ? (
          <ApplicationDetails applicationId={activeAppId} onBack={() => setActiveAppId(null)} />
        ) : activeTab === 'new-app' ? (
          <NewApplication onCreated={(app) => setActiveAppId(app.id)} />
        ) : activeTab === 'rules' ? (
          <RuleManagement />
        ) : activeTab === 'notifications' ? (
          <InstitutionNotifications />
        ) : (
          <InstitutionDashboard onNavigateNew={() => setActiveTab('new-app')} />
        )}
      </InstitutionLayout>
    );
  }

  // 2. Official Reviewer Flow
  if (role === 'official') {
    return (
      <OfficialLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'verifications' ? (
          <InstitutionVerifications />
        ) : activeTab === 'rules' ? (
          <RuleManagement />
        ) : activeTab === 'notifications' ? (
          <InstitutionNotifications />
        ) : (
          <ReviewApplication />
        )}
      </OfficialLayout>
    );
  }

  // 3. Administrator Flow
  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'verifications' ? (
        <InstitutionVerifications />
      ) : activeTab === 'rules' ? (
        <RuleManagement />
      ) : activeTab === 'notifications' ? (
        <InstitutionNotifications />
      ) : (
        <AdminDashboard />
      )}
    </AdminLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
