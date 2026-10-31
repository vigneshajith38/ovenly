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
  const [pieceCount, setPieceCount] = useState('');
  const [hasFlourChoice, setHasFlourChoice] = useState(false);
  const [isCustomAssorted, setIsCustomAssorted] = useState(false);
  const [assortedCapacity, setAssortedCapacity] = useState(3);
  const [assortedFlavoursInput, setAssortedFlavoursInput] = useState(
    'Signature Chocolate Chip, Double Chocolate Fudge, Red Velvet White Choc, Biscoff Lotus Swirl, Nutty Walnut Crunch, Salted Caramel Crisp'
  );
  const [isPublished, setIsPublished] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSqlHelper, setShowSqlHelper] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);

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
      const isBrownieProd = Boolean(
        (product.category && (product.category.toLowerCase().includes('brownie') || product.category === 'healthy-bakes')) || 
        (product.name && product.name.toLowerCase().includes('brownie'))
      );
      const isPackOf4 = Boolean(
        product.name && (product.name.toLowerCase().includes('pack of 4') || product.name.toLowerCase().includes('box of 4'))
      );
      const isPackOf1 = Boolean(
        product.name && (
          product.name.toLowerCase().includes('pack of 1') ||
          product.name.toLowerCase().includes('box of 1') ||
          product.name.toLowerCase().includes('single') ||
          product.name.toLowerCase().includes('1 piece') ||
          product.name.toLowerCase().includes('piece of 1')
        )
      );

      setCurrentProduct(product);
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price);
      setCategory(product.category || (isBrownieProd ? 'brownies' : 'cookie-tins'));
      setDietaryType(product.dietary_type || 'eggless');
      setPieceCount(product.piece_count || (isPackOf4 ? '4 Pieces (Pack of 4)' : (isPackOf1 ? '1 Piece (Pack of 1)' : (product.name?.includes('500g') ? '9 Pieces (500g Slab)' : ''))));
      setHasFlourChoice(true);
      setIsCustomAssorted(product.is_custom_assorted || isPackOf4 || isPackOf1 || false);
      setAssortedCapacity(product.assorted_capacity || (isPackOf4 ? 4 : (isPackOf1 ? 1 : (isBrownieProd ? 1 : 3))));
      
      const defaultFlavours = isBrownieProd
        ? 'Nutella, chocolate ganache, biscoff'
        : 'Signature Chocolate Chip, Double Chocolate Fudge, Red Velvet White Choc, Biscoff Lotus Swirl, Nutty Walnut Crunch, Salted Caramel Crisp';

      const isCookieDefault = Array.isArray(product.assorted_flavours) && product.assorted_flavours.includes('Signature Chocolate Chip');

      const flavours = Array.isArray(product.assorted_flavours) && !(isBrownieProd && isCookieDefault)
        ? product.assorted_flavours.join(', ')
        : defaultFlavours;
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
      setPieceCount('');
      setHasFlourChoice(false);
      setIsCustomAssorted(false);
      setAssortedCapacity(1);
      setAssortedFlavoursInput('Signature Chocolate Chip, Double Chocolate Fudge, Red Velvet White Choc, Biscoff Lotus Swirl, Nutty Walnut Crunch, Salted Caramel Crisp');
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
        is_published: isPublished,
        is_available: isAvailable,
        image_path
      };

      if (isCustomAssorted) {
        productData.is_custom_assorted = true;
        productData.assorted_capacity = parseInt(assortedCapacity, 10) || 1;
        productData.assorted_flavours = flavoursArray;
      } else {
        productData.is_custom_assorted = false;
      }

      let saveError = null;

      if (currentProduct) {
        const res = await supabase
          .from('products')
          .update(productData)
          .eq('id', currentProduct.id);
        saveError = res.error;
      } else {
        const res = await supabase
          .from('products')
          .insert([productData]);
        saveError = res.error;
      }

      // If Supabase table is missing the custom assorted columns
      if (saveError && (saveError.message?.includes('assorted') || saveError.message?.includes('column') || saveError.message?.includes('schema cache'))) {
        console.warn('Supabase missing assorted columns:', saveError.message);
        setShowSqlHelper(true);

        const saveBasic = window.confirm(
          "⚠️ Your Supabase database is missing the 'assorted_capacity' column.\n\n" +
          "Click OK to save your product photo, name & price right now!\n\n" +
          "Then run the 1-click SQL in your Supabase SQL Editor (shown at top) to enable the custom tin feature."
        );

        if (saveBasic) {
          const basicData = {
            name,
            description,
            price: parseFloat(price),
            category,
            is_published: isPublished,
            is_available: isAvailable,
            image_path
          };

          const basicRes = currentProduct 
            ? await supabase.from('products').update(basicData).eq('id', currentProduct.id)
            : await supabase.from('products').insert([basicData]);

          if (basicRes.error) throw basicRes.error;

          alert("Product saved successfully! To turn on the custom assorted tin feature, run the quick SQL shown at the top of the Admin page in Supabase.");
          await fetchProducts();
          closeModal();
          return;
        } else {
          return;
        }
      }

      if (saveError) throw saveError;

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
            Manage menu bakes, categories, and custom Assorted Tin options.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button"
            className="btn btn-outline" 
            style={{ fontSize: '0.85rem' }} 
            onClick={() => setShowSqlHelper(!showSqlHelper)}
          >
            ⚡ Supabase SQL Setup
          </button>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Plus size={20} style={{ marginRight: '8px' }} /> Add Product
          </button>
        </div>
      </div>

      {showSqlHelper && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: '0 0 6px', color: '#92400e', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚡</span> Supabase Setup for Custom Assorted Tins
              </h3>
              <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#78350f' }}>
                If you see <em>"Could not find the 'assorted_capacity' column"</em>, copy the SQL below, paste it into your <strong>Supabase SQL Editor</strong>, and click <strong>Run</strong>:
              </p>
            </div>
            <button 
              className="btn btn-outline" 
              style={{ padding: '4px 10px', fontSize: '0.8rem', borderColor: '#d97706', color: '#92400e' }}
              onClick={() => setShowSqlHelper(false)}
            >
              ✕ Hide
            </button>
          </div>
          
          <div>
            <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', overflowX: 'auto', margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>
{`ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_custom_assorted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS assorted_capacity INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS assorted_flavours JSONB DEFAULT '["Signature Chocolate Chip", "Double Chocolate Fudge", "Red Velvet White Choc", "Biscoff Lotus Swirl", "Nutty Walnut Crunch", "Salted Caramel Crisp"]'::jsonb,
ADD COLUMN IF NOT EXISTS piece_count TEXT,
ADD COLUMN IF NOT EXISTS has_flour_choice BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS flour_options JSONB DEFAULT '["Classic Maida", "Healthy Ragi"]'::jsonb;`}
            </pre>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                className="btn btn-primary" 
                style={{ padding: '7px 16px', fontSize: '0.85rem' }}
                onClick={() => {
                  navigator.clipboard.writeText(`ALTER TABLE products \nADD COLUMN IF NOT EXISTS is_custom_assorted BOOLEAN DEFAULT false,\nADD COLUMN IF NOT EXISTS assorted_capacity INTEGER DEFAULT 3,\nADD COLUMN IF NOT EXISTS assorted_flavours JSONB DEFAULT '["Signature Chocolate Chip", "Double Chocolate Fudge", "Red Velvet White Choc", "Biscoff Lotus Swirl", "Nutty Walnut Crunch", "Salted Caramel Crisp"]'::jsonb,\nADD COLUMN IF NOT EXISTS piece_count TEXT,\nADD COLUMN IF NOT EXISTS has_flour_choice BOOLEAN DEFAULT false,\nADD COLUMN IF NOT EXISTS flour_options JSONB DEFAULT '["Classic Maida", "Healthy Ragi"]'::jsonb;`);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2500);
                }}
              >
                {copiedSql ? '✓ Copied SQL to Clipboard!' : '📋 Copy SQL to Clipboard'}
              </button>
              <a 
                href="https://supabase.com/dashboard/project/nvonwgztqmpvxwkicajo/sql/new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ padding: '7px 16px', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Open Supabase SQL Editor ➔
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Assorted Tin</th>
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
                  {product.piece_count && (
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                      📦 {product.piece_count}
                    </span>
                  )}
                  {product.has_flour_choice && (
                    <span style={{ display: 'inline-block', fontSize: '0.7rem', color: 'var(--color-forest)', background: '#edf7ee', padding: '1px 6px', borderRadius: '4px', marginTop: '3px', fontWeight: '600' }}>
                      🌾 Maida / Ragi
                    </span>
                  )}
                  {product.is_custom_assorted && (
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-caramel)', fontWeight: 'bold', marginTop: '2px' }}>
                      ✨ Custom Assorted ({product.assorted_capacity || 1} {(product.category === 'brownies' || product.category === 'healthy-bakes') ? (product.assorted_capacity === 1 ? 'Piece' : 'Pieces') : 'Flavours'})
                    </span>
                  )}
                </td>
                <td>
                  {product.is_custom_assorted ? (
                    <span className="badge success" style={{ background: '#fdf4eb', color: 'var(--color-caramel)', border: '1px solid #fed7aa' }}>
                      ✨ Custom Mix ({product.assorted_capacity || 1} {(product.category === 'brownies' || product.category === 'healthy-bakes') ? (product.assorted_capacity === 1 ? 'Piece' : 'Pieces') : 'Flavours'})
                    </span>
                  ) : (
                    <span style={{ color: '#888', fontSize: '0.85rem' }}>Standard</span>
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
              {/* Price, Category & Piece Count */}
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '130px' }}>
                  <label>Price (₹) *</label>
                  <input type="number" required min="1" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                
                <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
                  <label>Category</label>
                  <select 
                    value={category} 
                    onChange={e => {
                      const val = e.target.value;
                      setCategory(val);
                      if (val === 'brownies' || val === 'healthy-bakes') {
                        setHasFlourChoice(true);
                        if (!pieceCount) setPieceCount(val === 'healthy-bakes' ? '1 Piece (Pack of 1)' : '9 Pieces (500g Slab)');
                        if (isCustomAssorted) {
                          setAssortedCapacity(val === 'healthy-bakes' ? 1 : 4);
                          setAssortedFlavoursInput('Nutella, chocolate ganache, biscoff');
                        }
                      }
                    }} 
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                  >
                    <option value="cookie-tins">Cookie Tins</option>
                    <option value="brownies">Brownies</option>
                    <option value="healthy-bakes">Healthy Bakes 🌱</option>
                    <option value="cupcakes">Cupcakes</option>
                    <option value="specials">Specials</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1.2, minWidth: '180px' }}>
                  <label>Piece Count / Pack Size</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 1 Piece (Pack of 1), 4 Pieces, 9 Pieces (500g Slab)" 
                    value={pieceCount} 
                    onChange={e => setPieceCount(e.target.value)} 
                  />
                </div>
              </div>

              {/* Flour Choice Checkbox (Maida vs Ragi) */}
              <div className="checkbox-group" style={{ marginBottom: '16px', background: '#f5f9f6', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d4edd6' }}>
                <input 
                  type="checkbox" 
                  id="hasFlourChoice" 
                  checked={hasFlourChoice} 
                  onChange={e => setHasFlourChoice(e.target.checked)} 
                />
                <label htmlFor="hasFlourChoice" style={{ fontWeight: '600', color: 'var(--color-forest)', cursor: 'pointer' }}>
                  🌾 Flour Base Selection: Allow customer to choose between <strong>Classic Maida</strong> or <strong>Healthy Ragi</strong>
                </label>
              </div>

              {/* Custom Assorted Configuration */}
              <div style={{ background: '#fcf8f2', border: '1px solid #f0e4d0', borderRadius: '12px', padding: '15px', marginBottom: '20px' }}>
                <div className="checkbox-group" style={{ marginBottom: isCustomAssorted ? '12px' : '0' }}>
                  <input 
                    type="checkbox" 
                    id="isCustomAssorted" 
                    checked={isCustomAssorted} 
                    onChange={e => {
                      const checked = e.target.checked;
                      setIsCustomAssorted(checked);
                      if (checked && (category === 'brownies' || category === 'healthy-bakes')) {
                        setAssortedCapacity(category === 'healthy-bakes' ? 1 : 4);
                        setAssortedFlavoursInput('Nutella, chocolate ganache, biscoff');
                      }
                    }} 
                  />
                  <label htmlFor="isCustomAssorted" style={{ fontWeight: 'bold', color: 'var(--color-dark-chocolate)' }}>
                    ✨ Custom Assorted Box / Tin (Allow customers to customize which flavours go into their box)
                  </label>
                </div>

                {isCustomAssorted && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <div className="form-group" style={{ marginBottom: '5px' }}>
                      <label style={{ fontSize: '0.85rem' }}>
                        Capacity (Number of pieces/flavours, e.g. 1 for Single Piece / Pack of 1, 4 for Box of 4, 3 for Cookie Tin)
                      </label>
                      <input 
                        type="number" 
                        min="1" 
                        max="24"
                        value={assortedCapacity} 
                        onChange={e => setAssortedCapacity(e.target.value)} 
                        style={{ width: '120px' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '0' }}>
                      <label style={{ fontSize: '0.85rem' }}>Available Flavours to Choose From (Comma-separated)</label>
                      <textarea 
                        rows="2"
                        value={assortedFlavoursInput} 
                        onChange={e => setAssortedFlavoursInput(e.target.value)}
                        placeholder="Nutella, chocolate ganache, biscoff"
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
