
import './i18n';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Kitchen from './pages/Kitchen';
import OrderPage from './pages/OrderPage';
import OrderStatusPage from './pages/OrderStatusPage';
import SalesAnalyticsDashboard from './views/SalesAnalyticsDashboard';
import ReviewsPage from './pages/ReviewsPage';
import AdminReviewsPage from './pages/AdminReviewsPage';

import Login from './components/Login';
import UserManagement from './modules/users/UserManagement';
import UserForm from './modules/users/UserForm';
import { useNavigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  // Wrapper para usar useNavigate en rutas v6+
  function LoginWithRedirect(props) {
    const navigate = useNavigate();
    return <Login {...props} navigate={navigate} />;
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/orders/:orderId" element={<OrderStatusPage />} />
        <Route path="/login" element={<LoginWithRedirect />} />
        <Route element={<MainLayout />}>
          <Route path="/kitchen" element={
            <ProtectedRoute allowedRoles={["ADMIN", "KITCHEN"]}>
              <Kitchen />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/analytics" element={
            <ProtectedRoute requireAdmin={true}>
              <SalesAnalyticsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute requireAdmin={true}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/users/new" element={
            <ProtectedRoute requireAdmin={true}>
              <UserForm />
            </ProtectedRoute>
          } />
          <Route path="/users/:id" element={
            <ProtectedRoute requireAdmin={true}>
              <UserForm />
            </ProtectedRoute>
          } />
        </Route>
        <Route path="/reviews" element={
            <ReviewsPage />
        } />
        <Route path="/admin/reviews" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminReviewsPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;