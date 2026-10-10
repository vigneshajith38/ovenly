import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Upload, Loader } from 'lucide-react';

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    if (!supabase) return setLoading(false);
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .list('gallery', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;
      
      // Filter out the empty folder placeholder if any
      const files = data.filter(file => file.name !== '.emptyFolderPlaceholder' && file.name !== 'gallery');
      
      const imagesWithUrls = files.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(`gallery/${file.name}`);
        return { ...file, publicUrl };
      });
      
      setImages(imagesWithUrls);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return alert('Please select an image file first.');
    
    setUploading(true);
    try {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, uploadFile);
        
      if (uploadError) throw uploadError;
      
      alert('Image uploaded successfully!');
      setUploadFile(null);
      // Reset file input
      document.getElementById('gallery-upload-input').value = "";
      fetchGalleryImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (fileName) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const { error } = await supabase.storage
        .from('product-images')
        .remove([`gallery/${fileName}`]);
        
      if (error) throw error;
      
      setImages(images.filter(img => img.name !== fileName));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Gallery Management</h1>
      </div>
      
      <div className="admin-form-container" style={{ marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h3>Upload New Photo</h3>
        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginTop: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Select Image</label>
            <input 
              id="gallery-upload-input"
              type="file" 
              accept="image/*"
              onChange={e => setUploadFile(e.target.files[0])} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={uploading || !uploadFile} style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '44px' }}>
            {uploading ? <Loader className="spin" size={18} /> : <Upload size={18} />}
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      {loading ? (
        <div>Loading gallery...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {images.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', background: 'white', borderRadius: '8px' }}>
              No images in the gallery yet. Upload some above!
            </p>
          ) : (
            images.map(img => (
              <div key={img.name} style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'relative' }}>
                <img src={img.publicUrl} alt="Gallery item" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '6px', color: '#c62828', borderColor: '#c62828' }} 
                    onClick={() => deleteImage(img.name)} 
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
