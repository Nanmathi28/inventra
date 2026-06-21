import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Forecast from './pages/Forecast';
import { Restock } from './pages/Restock';
import Expiry from './pages/Expiry';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import Assistant from './pages/Assistant';
import Settings from './pages/Settings';
import CustomerPortal from './pages/dashboards/CustomerPortal';

function ProtectedRoute({ children, roles }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-gray-700 dark:text-gray-200">Loading authentication…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'customer') return <Navigate to="/portal" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-gray-700 dark:text-gray-200">Loading authentication…</div>;
  if (user) {
    if (user.role === 'customer') return <Navigate to="/portal" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/portal" element={<ProtectedRoute roles={['customer']}><CustomerPortal /></ProtectedRoute>} />

      {/* Admin + Pharmacist app */}
      <Route path="/" element={<ProtectedRoute roles={['admin', 'pharmacist']}><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="forecast" element={<Forecast />} />
        <Route path="restock" element={<Restock />} />
        <Route path="expiry" element={<Expiry />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="reports" element={<ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>} />
        <Route path="suppliers" element={<ProtectedRoute roles={['admin']}><Suppliers /></ProtectedRoute>} />
        <Route path="assistant" element={<Assistant />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
