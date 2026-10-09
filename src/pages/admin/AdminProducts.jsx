import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Check, X, Upload } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('cookie-tins');
  const [isPublished, setIsPublished] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!supabase) return setLoading(false);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const openModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price);
      setCategory(product.category || 'cookie-tins');
      setIsPublished(product.is_published);
      setIsAvailable(product.is_available);
      setPhotoPreview(product.image_path || '');
      setPhoto(null);
    } else {
      setCurrentProduct(null);
      setName('');
      setDescription('');
      setPrice('');
      setCategory('cookie-tins');
      setIsPublished(false);
      setIsAvailable(true);
      setPhotoPreview('');
      setPhoto(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let image_path = photoPreview;

      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, photo);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        image_path = publicUrl;
      }

      const productData = {
        name,
        description,
        price: parseFloat(price),
        category,
        is_published: isPublished,
        is_available: isAvailable,
        image_path
      };

      if (currentProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', currentProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
      }

      await fetchProducts();
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      <div className="admin-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={20} style={{ marginRight: '8px' }} /> Add Product
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Status</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  {product.image_path ? (
                    <img src={product.image_path} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '8px' }}></div>
                  )}
                </td>
                <td>{product.name}</td>
                <td>₹{product.price}</td>
                <td>
                  <span className={`badge ${product.is_published ? 'success' : 'warning'}`}>
                    {product.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${product.is_available ? 'success' : 'error'}`}>
                    {product.is_available ? 'Available' : 'Sold Out'}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => openModal(product)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '6px 10px', color: '#c62828', borderColor: '#c62828' }} onClick={() => deleteProduct(product.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No products found. Create one!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{currentProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button className="close-btn" onClick={closeModal}><X size={24} /></button>
            </div>
            
            <form onSubmit={saveProduct}>
              <div className="form-group">
                <label>Product Name *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              
              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Price (₹) *</label>
                  <input type="number" required min="1" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd' }}>
                    <option value="cookie-tins">Cookie Tins</option>
                    <option value="cupcakes">Cupcakes</option>
                    <option value="brownies">Brownies</option>
                    <option value="specials">Specials</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Product Image</label>
                {photoPreview && (
                  <img src={photoPreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px', display: 'block' }} />
                )}
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
              </div>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
                <div className="checkbox-group">
                  <input type="checkbox" id="isPublished" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} />
                  <label htmlFor="isPublished">Publish (Visible to public)</label>
                </div>
                
                <div className="checkbox-group">
                  <input type="checkbox" id="isAvailable" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} />
                  <label htmlFor="isAvailable">Available (Can be ordered)</label>
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
