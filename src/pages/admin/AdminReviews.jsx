import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, Trash2 } from 'lucide-react';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    if (!supabase) return setLoading(false);
    setLoading(true);
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', filter)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(error);
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          status,
          approved_at: status === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Remove from current view
      setReviews(reviews.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review status');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      setReviews(reviews.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Reviews Management</h1>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button 
          className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
      </div>

      {loading ? (
        <div>Loading reviews...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Photo</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review.id}>
                  <td>{review.customer_name}</td>
                  <td>{review.rating} ⭐</td>
                  <td style={{ maxWidth: '300px' }}>{review.review_text}</td>
                  <td>
                    {review.photo_path ? (
                      <a href={review.photo_path} target="_blank" rel="noreferrer">
                        <img src={review.photo_path} alt="Review" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      </a>
                    ) : 'None'}
                  </td>
                  <td>{new Date(review.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-actions">
                      {filter !== 'approved' && (
                        <button className="btn btn-outline" style={{ padding: '6px 10px', color: '#2e7d32', borderColor: '#2e7d32' }} onClick={() => updateStatus(review.id, 'approved')} title="Approve">
                          <Check size={16} />
                        </button>
                      )}
                      {filter !== 'rejected' && (
                        <button className="btn btn-outline" style={{ padding: '6px 10px', color: '#f57f17', borderColor: '#f57f17' }} onClick={() => updateStatus(review.id, 'rejected')} title="Reject">
                          <X size={16} />
                        </button>
                      )}
                      <button className="btn btn-outline" style={{ padding: '6px 10px', color: '#c62828', borderColor: '#c62828' }} onClick={() => deleteReview(review.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No {filter} reviews found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
