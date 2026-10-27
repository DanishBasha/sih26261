import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import InstitutionLayout from './layouts/InstitutionLayout';
import OfficialLayout from './layouts/OfficialLayout';
import AdminLayout from './layouts/AdminLayout';

// Institution Pages
import InstitutionDashboard from './pages/institution/Dashboard';
import NewApplication from './pages/institution/NewApplication';
import ApplicationDetails from './pages/institution/ApplicationDetails';
import InstitutionNotifications from './pages/institution/Notifications';

// Official Pages
import ReviewApplication from './pages/official/ReviewApplication';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import RuleManagement from './pages/admin/RuleManagement';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeAppId, setActiveAppId] = useState(null);

  // Render Institution View
  if (user.role === 'institution') {
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

  // Render Official Reviewer View
  if (user.role === 'official') {
    return (
      <OfficialLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'rules' ? (
          <RuleManagement />
        ) : activeTab === 'notifications' ? (
          <InstitutionNotifications />
        ) : (
          <ReviewApplication />
        )}
      </OfficialLayout>
    );
  }

  // Render Admin View
  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'rules' ? (
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
