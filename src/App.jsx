import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Kitchen from './pages/Kitchen';
import OrderStatusPage from './pages/OrderStatusPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/orders/:orderId" element={<OrderStatusPage />} />
      </Routes>
    </Router>
  );
}

export default App;
