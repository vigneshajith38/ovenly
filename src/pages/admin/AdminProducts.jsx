import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Check, X, Upload, Sparkles } from 'lucide-react';

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
  const [dietaryType, setDietaryType] = useState('eggless'); // 'eggless' | 'contains_egg' | 'choice'
  const [isCustomAssorted, setIsCustomAssorted] = useState(false);
  const [assortedCapacity, setAssortedCapacity] = useState(6);
  const [assortedFlavoursInput, setAssortedFlavoursInput] = useState(
    'Signature Choc Chip, Double Chocolate Fudge, Red Velvet White Choc, Nutty Walnut Crunch, Biscoff Lotus Swirl, Salted Caramel Crisp'
  );
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
      setDietaryType(product.dietary_type || 'eggless');
      setIsCustomAssorted(product.is_custom_assorted || false);
      setAssortedCapacity(product.assorted_capacity || 6);
      
      const flavours = Array.isArray(product.assorted_flavours) 
        ? product.assorted_flavours.join(', ')
        : 'Signature Choc Chip, Double Chocolate Fudge, Red Velvet White Choc, Nutty Walnut Crunch, Biscoff Lotus Swirl, Salted Caramel Crisp';
      setAssortedFlavoursInput(flavours);

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
      setDietaryType('eggless');
      setIsCustomAssorted(false);
      setAssortedCapacity(6);
      setAssortedFlavoursInput('Signature Choc Chip, Double Chocolate Fudge, Red Velvet White Choc, Nutty Walnut Crunch, Biscoff Lotus Swirl, Salted Caramel Crisp');
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

      const flavoursArray = assortedFlavoursInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const productData = {
        name,
        description,
        price: parseFloat(price),
        category,
        dietary_type: dietaryType,
        is_custom_assorted: isCustomAssorted,
        assorted_capacity: parseInt(assortedCapacity, 10) || 6,
        assorted_flavours: flavoursArray,
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
      alert('Failed to save product: ' + (error.message || error));
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
        <div>
          <h1>Products & Bakes</h1>
          <p style={{ color: '#666', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Manage menu bakes, Egg / Eggless dietary types, and custom Assorted Tins.
          </p>
        </div>
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
              <th>Dietary Type</th>
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
                <td>
                  <strong>{product.name}</strong>
                  {product.is_custom_assorted && (
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-caramel)', fontWeight: 'bold' }}>
                      ✨ Assorted Tin ({product.assorted_capacity || 6} pk)
                    </span>
                  )}
                </td>
                <td>
                  {(!product.dietary_type || product.dietary_type === 'eggless') && (
                    <span className="badge success" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                      🟢 100% Eggless
                    </span>
                  )}
                  {product.dietary_type === 'contains_egg' && (
                    <span className="badge error" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                      🔴 Contains Egg
                    </span>
                  )}
                  {product.dietary_type === 'choice' && (
                    <span className="badge warning" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                      🔄 Eggless / Egg Choice
                    </span>
                  )}
                </td>
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
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No products found. Create one!</td>
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

              {/* Price & Category */}
              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Price (₹) *</label>
                  <input type="number" required min="1" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                    <option value="cookie-tins">Cookie Tins</option>
                    <option value="cupcakes">Cupcakes</option>
                    <option value="brownies">Brownies</option>
                    <option value="specials">Specials</option>
                  </select>
                </div>
              </div>

              {/* Dietary Specification (Egg or Eggless) */}
              <div className="form-group">
                <label style={{ fontWeight: 'bold', color: 'var(--color-forest)' }}>Dietary Type (Egg / Eggless)</label>
                <select 
                  value={dietaryType} 
                  onChange={e => setDietaryType(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #ddd', background: '#fafafa', fontWeight: '500' }}
                >
                  <option value="eggless">🟢 100% Eggless</option>
                  <option value="contains_egg">🔴 Contains Egg</option>
                  <option value="choice">🔄 Choice Available (Customer picks Eggless or With Egg)</option>
                </select>
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                  Informs customers whether this treat is purely eggless or if they can choose.
                </small>
              </div>

              {/* Custom Assorted Tin Configuration */}
              <div style={{ background: '#fcf8f2', border: '1px solid #f0e4d0', borderRadius: '12px', padding: '15px', marginBottom: '20px' }}>
                <div className="checkbox-group" style={{ marginBottom: isCustomAssorted ? '12px' : '0' }}>
                  <input 
                    type="checkbox" 
                    id="isCustomAssorted" 
                    checked={isCustomAssorted} 
                    onChange={e => setIsCustomAssorted(e.target.checked)} 
                  />
                  <label htmlFor="isCustomAssorted" style={{ fontWeight: 'bold', color: 'var(--color-dark-chocolate)' }}>
                    ✨ Custom Assorted Tin (Allow customers to pick their own mix of flavours)
                  </label>
                </div>

                {isCustomAssorted && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <div className="form-group" style={{ marginBottom: '5px' }}>
                      <label style={{ fontSize: '0.85rem' }}>Tin Capacity (Number of treats, e.g. 6 or 12)</label>
                      <input 
                        type="number" 
                        min="2" 
                        max="24"
                        value={assortedCapacity} 
                        onChange={e => setAssortedCapacity(e.target.value)} 
                        style={{ width: '120px' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '0' }}>
                      <label style={{ fontSize: '0.85rem' }}>Available Flavours (Comma-separated)</label>
                      <textarea 
                        rows="2"
                        value={assortedFlavoursInput} 
                        onChange={e => setAssortedFlavoursInput(e.target.value)}
                        placeholder="Signature Choc Chip, Double Chocolate Fudge, Red Velvet..."
                      />
                    </div>
                  </div>
                )}
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
                  <label htmlFor="isPublished">Publish (Visible in shop)</label>
                </div>
                
                <div className="checkbox-group">
                  <input type="checkbox" id="isAvailable" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} />
                  <label htmlFor="isAvailable">Available (In stock)</label>
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
