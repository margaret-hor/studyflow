import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';

import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Layout from './components/layout/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Library from './pages/Library/Library';
import Notes from './pages/Notes/Notes';
import AIAssistant from './pages/AIAssistant/AIAssistant';
import Calendar from './pages/Calendar/Calendar';
import BookDetail from './pages/Library/components/BookDetail';

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />

        {/* Protected routes with Layout */}
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/aiassistant" element={<AIAssistant />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/book/:id" element={<BookDetail />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </>
  );
}

export default App;