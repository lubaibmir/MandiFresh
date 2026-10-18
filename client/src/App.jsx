import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Guard from './components/Guard.jsx';
import Home from './pages/Home.jsx';
import Produce from './pages/Produce.jsx';
import Vendors from './pages/Vendors.jsx';
import VendorPage from './pages/VendorPage.jsx';
import Cart from './pages/Cart.jsx';
import Orders from './pages/Orders.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { Login, Register } from './pages/Auth.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produce/:key" element={<Produce />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/vendors/:id" element={<VendorPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Guard role="customer"><Orders /></Guard>} />
          <Route path="/dashboard" element={<Guard role="vendor"><Dashboard /></Guard>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<p className="py-20 text-center text-muted">Page not found.</p>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
