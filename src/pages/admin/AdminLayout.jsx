import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Package, Star, LogOut } from 'lucide-react';
import './Admin.css';

const AdminLayout = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="admin-loading">Loading Admin...</div>;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>Ovenly Admin</h2>
        </div>
        <nav className="admin-nav">
          <Link to="/admin/products" className={location.pathname === '/admin/products' ? 'active' : ''}>
            <Package size={20} /> Products
          </Link>
          <Link to="/admin/reviews" className={location.pathname === '/admin/reviews' ? 'active' : ''}>
            <Star size={20} /> Reviews
          </Link>
        </nav>
        <div className="admin-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
