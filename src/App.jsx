import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to='/login' replace />;
  }
  return children;
}

function App() {
  const { currentUser } = useAuth();

  return (
    <div className="page_wrapper">
      <Routes>
        {/*public routes*/}
        <Route
          path='/login'
          element={currentUser ? <Navigate to="/dashboard" /> : <Login />}
        />
        {/*protected routes*/}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/*root route*/}
        <Route
          path="/"
          element={<Navigate to={currentUser ? "/dashboard" : "/login"} />}
        />
        {/*any else*/}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;