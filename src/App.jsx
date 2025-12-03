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
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/orders/:orderId" element={<OrderStatusPage />} />
        <Route path="/dashboard/analytics" element={<SalesAnalyticsDashboard />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/admin/reviews" element={<AdminReviewsPage />} />
        <Route path="/login" element={<LoginWithRedirect />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/users/new" element={<UserForm />} />
        <Route path="/users/:id" element={<UserForm />} />
      </Routes>
    </Router>
  );
}

export default App;