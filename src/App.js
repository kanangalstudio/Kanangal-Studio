import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages - to be created
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Families from './pages/Families';
import FamilyDetail from './pages/FamilyDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import AlbumDetail from './pages/AlbumDetail';
import Upload from './pages/Upload';
import Settings from './pages/Settings';
import Published from './pages/Published';
import Inquiry from './pages/Inquiry';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    }}>
      <div className="loader-spinner" />
      <div className="loader-logo">Kanangal</div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/inquiry/:studioId" element={<Inquiry />} />

        {/* Protected Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/families" element={<Families />} />
                <Route path="/families/:id" element={<FamilyDetail />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/albums/:id" element={<AlbumDetail />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/published" element={<Published />} />
                <Route path="/settings" element={<Settings />} />
                {/* Redirect any other protected routes to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
