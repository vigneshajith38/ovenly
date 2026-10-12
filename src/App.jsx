import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Shop from './components/Shop';
import AboutContact from './components/AboutContact';
import ReviewsPage from './pages/ReviewsPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProducts from './pages/admin/AdminProducts';
import AdminReviews from './pages/admin/AdminReviews';

import CategoryCards from './components/CategoryCards';
import BestSellers from './components/BestSellers';
import WhyChooseUs from './components/WhyChooseUs';
import CustomerLoveBanner from './components/CustomerLoveBanner';
import { GlobalBackground } from './components/Doodles';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';

import './App.css';

function Home() {
  return (
    <>
      <div style={{ position: 'relative' }}>
        <Hero />
        <CategoryCards />
        <BestSellers />
        <WhyChooseUs />
        <CustomerLoveBanner />
      </div>
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app-container">
          <GlobalBackground />
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/about" element={<AboutContact />} />

              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/products" replace />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="reviews" element={<AdminReviews />} />

              </Route>
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
