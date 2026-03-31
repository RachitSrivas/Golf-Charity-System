import { AuthProvider } from './context/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public
import Home from './pages/public/Home';
import Charities from './pages/public/Charities';
import HowItWorks from './pages/public/HowItWorks';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DemoCheckout from './pages/auth/DemoCheckout';

// Dashboard
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import ScoresPage from './pages/dashboard/ScoresPage';
import CharityPage from './pages/dashboard/CharityPage';
import DrawsPage from './pages/dashboard/DrawsPage';
import WinningsPage from './pages/dashboard/WinningsPage';
import SubscriptionPage from './pages/dashboard/SubscriptionPage';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import UsersPage from './pages/admin/UsersPage';
import DrawManagementPage from './pages/admin/DrawManagementPage';
import CharityManagementPage from './pages/admin/CharityManagementPage';
import WinnersAdminPage from './pages/admin/WinnersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  // Show spinner only on initial load — never redirect mid-session
  if (loading) return <div style={{ display:'flex',justifyContent:'center',alignItems:'center',height:'80vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',justifyContent:'center',alignItems:'center',height:'80vh' }}><div className="spinner" /></div>;
  // Must be logged in first
  if (!user) return <Navigate to="/login" replace />;
  // If profile hasn't loaded yet (API still fetching), show spinner instead of redirecting
  if (profile === null) return <div style={{ display:'flex',justifyContent:'center',alignItems:'center',height:'80vh' }}><div className="spinner" /></div>;
  if (profile.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
      <Route path="/charities" element={<><Navbar /><Charities /><Footer /></>} />
      <Route path="/how-it-works" element={<><Navbar /><HowItWorks /><Footer /></>} />
      <Route path="/login" element={<><Navbar /><Login /><Footer /></>} />
      <Route path="/register" element={<><Navbar /><Register /><Footer /></>} />
      <Route path="/demo-checkout" element={<><Navbar /><DemoCheckout /><Footer /></>} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="scores" element={<ScoresPage />} />
        <Route path="charity" element={<CharityPage />} />
        <Route path="draws" element={<DrawsPage />} />
        <Route path="winnings" element={<WinningsPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AnalyticsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="draws" element={<DrawManagementPage />} />
        <Route path="charities" element={<CharityManagementPage />} />
        <Route path="winners" element={<WinnersAdminPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
