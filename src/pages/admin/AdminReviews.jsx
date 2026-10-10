import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, Trash2, Plus, Upload } from 'lucide-react';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected
  
  // Upload state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadName, setUploadName] = useState('Instagram Customer');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return alert('Please select an image file first.');
    
    setUploading(true);
    try {
      // 1. Upload image to Supabase Storage
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `screenshots/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(filePath, uploadFile);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('review-photos')
        .getPublicUrl(filePath);
        
      // 2. Insert into reviews table as approved
      const { error: insertError } = await supabase
        .from('reviews')
        .insert([{
          customer_name: uploadName,
          rating: 5,
          review_text: 'Screenshot review uploaded by admin.',
          photo_path: publicUrl,
          status: 'approved',
          approved_at: new Date().toISOString()
        }]);
        
      if (insertError) throw insertError;
      
      alert('Screenshot uploaded successfully!');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadName('Instagram Customer');
      
      // Refresh if we are on approved tab
      if (filter === 'approved') {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      alert('Error uploading screenshot: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Reviews Management</h1>
        <button className="btn btn-primary" onClick={() => setIsUploadModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={18} /> Add Screenshot
        </button>
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

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay" onClick={() => !uploading && setIsUploadModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Review Screenshot</h2>
              <button className="close-btn" onClick={() => setIsUploadModalOpen(false)} disabled={uploading}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="admin-form">
              <div className="form-group">
                <label>Customer Name or Source</label>
                <input 
                  type="text" 
                  value={uploadName} 
                  onChange={e => setUploadName(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Screenshot Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setUploadFile(e.target.files[0])} 
                  required 
                />
                {uploadFile && (
                  <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--color-cookie-brown)' }}>
                    Selected: {uploadFile.name}
                  </p>
                )}
              </div>
              
              <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsUploadModalOpen(false)} disabled={uploading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading || !uploadFile}>
                  {uploading ? 'Uploading...' : 'Upload & Approve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
