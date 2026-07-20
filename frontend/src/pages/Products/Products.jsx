import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OutlineButton from '../../components/buttons/OutlineButton';
import StatusBadge from '../../components/badges/StatusBadge';
import Pagination from '../../components/pagination/Pagination';
import Modal from '../../components/modal/Modal';
import Toast from '../../components/toast/Toast';
import ProductService from '../../services/ProductService';
import ProductCategoryService from '../../services/ProductCategoryService';
import ProductBrandService from '../../services/ProductBrandService';
import {
  Package,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  FolderTree,
  Tag,
  Download,
  Upload,
  Check,
  AlertCircle
} from 'lucide-react';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStockStatus, setSelectedStockStatus] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Selection for Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    productCode: '',
    sku: '',
    barcode: '',
    category: '',
    brand: '',
    unitPrice: 0,
    costPrice: 0,
    stockQuantity: 0,
    reorderLevel: 5,
    description: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchProducts();
    fetchCategoriesAndBrands();
  }, [currentPage, search, selectedCategory, selectedBrand, selectedStockStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await ProductService.getAll({
        search,
        category: selectedCategory,
        brand: selectedBrand,
        stockStatus: selectedStockStatus,
        page: currentPage,
        limit: 10
      });
      setProducts(res.data.data || []);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalRecords(res.data.pagination.totalRecords || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndBrands = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        ProductCategoryService.getAll(),
        ProductBrandService.getAll()
      ]);
      setCategories(catRes.data.data || []);
      setBrands(brandRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id || p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await ProductService.create(formData);
      setIsCreateModalOpen(false);
      setToast({ show: true, message: 'Product created successfully', type: 'success' });
      setFormData({
        name: '',
        productCode: '',
        sku: '',
        barcode: '',
        category: '',
        brand: '',
        unitPrice: 0,
        costPrice: 0,
        stockQuantity: 0,
        reorderLevel: 5,
        description: ''
      });
      fetchProducts();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create product');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected products?`)) return;
    try {
      await ProductService.bulkDelete(selectedIds);
      setSelectedIds([]);
      setToast({ show: true, message: 'Products deleted', type: 'success' });
      fetchProducts();
    } catch (err) {
      alert('Bulk delete failed');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await ProductCategoryService.create({ name: newCatName });
      setNewCatName('');
      setIsCategoryModalOpen(false);
      fetchCategoriesAndBrands();
    } catch (err) {
      alert('Failed to create category');
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      await ProductBrandService.create({ name: newBrandName });
      setNewBrandName('');
      setIsBrandModalOpen(false);
      fetchCategoriesAndBrands();
    } catch (err) {
      alert('Failed to create brand');
    }
  };

  return (
    <PageContainer
      title="Product Catalog"
      subtitle="Manage product listings, pricing, variants, and stock balances"
      action={
        <div className="flex items-center gap-2">
          <OutlineButton onClick={() => setIsCategoryModalOpen(true)} className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" /> Categories
          </OutlineButton>
          <OutlineButton onClick={() => setIsBrandModalOpen(true)} className="flex items-center gap-2">
            <Tag className="h-4 w-4" /> Brands
          </OutlineButton>
          <PrimaryButton onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </PrimaryButton>
        </div>
      }
    >
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Advanced Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search Name, SKU, Barcode..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => { setSelectedBrand(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b._id} value={b.name}>{b.name}</option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={selectedStockStatus}
            onChange={(e) => { setSelectedStockStatus(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Stock Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1.5 rounded-lg">
            <span className="text-xs text-indigo-300 font-semibold">{selectedIds.length} Selected</span>
            <button
              onClick={handleBulkDelete}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 bg-rose-950/50 rounded"
            >
              Delete Bulk
            </button>
          </div>
        )}
      </div>

      {/* Product Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4 w-8">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length > 0 && selectedIds.length === products.length}
                />
              </th>
              <th className="py-3 px-4">Product Details</th>
              <th className="py-3 px-4">Category & Brand</th>
              <th className="py-3 px-4 text-right">Price</th>
              <th className="py-3 px-4 text-center">Stock</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">Loading products...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">No products found matching filters</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id || product._id}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/products/${product.id || product._id}`)}
                >
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id || product._id)}
                      onChange={() => handleSelectOne(product.id || product._id)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 font-bold">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-100 hover:text-indigo-400">{product.name}</p>
                        <p className="text-[10px] text-slate-500">SKU: {product.sku || product.productCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <p className="font-semibold">{product.category || 'General'}</p>
                    <span className="text-[10px] text-slate-500">{product.brand || 'Generic'}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-200">
                    ${(product.unitPrice || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-slate-200">{product.stockQuantity || 0}</span>
                    <span className="text-[10px] text-slate-500 block">Avail: {product.availableQuantity || 0}</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={product.stockStatus || 'In Stock'} />
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/products/${product.id || product._id}`)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="p-4 border-t border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* Create Product Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Product"
      >
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
          </div>
        )}
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Product Code</label>
              <input
                type="text"
                value={formData.productCode}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                placeholder="Auto-generated if empty"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Barcode</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                placeholder="e.g. Electric Motors"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                placeholder="e.g. Siemens"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Selling Price ($) *</label>
              <input
                type="number"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Initial Stock</label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Reorder Level</label>
              <input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value, 10) || 5 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <OutlineButton type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</OutlineButton>
            <PrimaryButton type="submit">Create Product</PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Manage Categories">
        <div className="space-y-3 text-xs">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New Category Name..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
            />
            <PrimaryButton onClick={handleCreateCategory}>Add</PrimaryButton>
          </div>
          <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg max-h-60 overflow-y-auto">
            {categories.map((c) => (
              <div key={c._id} className="p-2.5 flex justify-between items-center text-slate-200 font-semibold">
                <span>{c.name}</span>
                <span className="text-[10px] text-slate-500">Active</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Brand Modal */}
      <Modal isOpen={isBrandModalOpen} onClose={() => setIsBrandModalOpen(false)} title="Manage Brands">
        <div className="space-y-3 text-xs">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New Brand Name..."
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
            />
            <PrimaryButton onClick={handleCreateBrand}>Add</PrimaryButton>
          </div>
          <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg max-h-60 overflow-y-auto">
            {brands.map((b) => (
              <div key={b._id} className="p-2.5 flex justify-between items-center text-slate-200 font-semibold">
                <span>{b.name}</span>
                <span className="text-[10px] text-slate-500">Active</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
