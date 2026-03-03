import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth }  from './context/AuthContext'
import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardHome  from './pages/dashboard/DashboardHome'
import BookingsPage   from './pages/dashboard/BookingsPage'
import InventoryPage  from './pages/dashboard/InventoryPage'
import BillingPage    from './pages/dashboard/BillingPage'

// Redirects unauthenticated users to /login
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Redirects already-logged-in users away from auth pages
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected dashboard — nested under the shared sidebar layout */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index         element={<DashboardHome />} />
        <Route path="bookings"  element={<BookingsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="billing"   element={<BillingPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
