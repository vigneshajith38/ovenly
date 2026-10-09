import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './Admin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  React.useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured. Check .env file.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    }
    setLoading(false);
  };

  if (session) {
    return <Navigate to="/admin/products" replace />;
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h2>Ovenly Admin Login</h2>
        <p>Sign in to manage products and reviews.</p>
        
        {error && <div className="admin-error">{error}</div>}
        
        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
