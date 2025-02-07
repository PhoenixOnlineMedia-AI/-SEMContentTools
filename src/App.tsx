import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChatInterface } from './components/ChatInterface';
import { Bot } from 'lucide-react';
import { useContentStore } from './lib/store';
import { EditorPage } from './components/EditorPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { VerifySuccessPage } from './pages/VerifySuccessPage';
import { ContentListPage } from './pages/ContentListPage';
import { PricingPage } from './pages/PricingPage';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { Menu } from './components/Menu';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { step } = useContentStore();
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">SEM Content Tools</h1>
            </div>
            {session && <Menu />}
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-success" element={<VerifySuccessPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route
          path="/content"
          element={
            <ProtectedRoute>
              <ContentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <div className="max-w-7xl mx-auto px-4 py-6">
                <EditorPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="max-w-7xl mx-auto px-4 py-6">
                {step === 'content' ? (
                  <EditorPage />
                ) : (
                  <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-12rem)]">
                    <ChatInterface />
                  </div>
                )}
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;