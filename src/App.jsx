import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Kitchen from './pages/Kitchen';
import OrderPage from './pages/OrderPage';
import OrderStatusPage from './pages/OrderStatusPage';
import SalesAnalyticsDashboard from './views/SalesAnalyticsDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/orders/:orderId" element={<OrderStatusPage />} />
        <Route path="/dashboard/analytics" element={<SalesAnalyticsDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;