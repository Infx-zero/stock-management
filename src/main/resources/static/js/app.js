// ===== GLOBAL VARIABLES =====
let products = [];
let editingProductId = null;

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    loadProducts();
});

// ===== INITIALIZATION =====
function initApp() {
    // Menu toggle
    document.getElementById('menuToggle')?.addEventListener('click', toggleSidebar);
    
    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductForm);
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    
    // Quick sale product select
    const quickProductSelect = document.getElementById('quickProductSelect');
    if (quickProductSelect) {
        quickProductSelect.addEventListener('change', updateQuickSaleQuantity);
    }
    
    // Load products for quick sale
    loadQuickSaleProducts();
}

// ===== SIDEBAR TOGGLE =====
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

// ===== MODAL FUNCTIONS =====
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = 'auto';
    resetProductForm();
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// ===== PRODUCTS MANAGEMENT =====
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        renderProductsTable(products);
        loadQuickSaleProducts();
        loadSalesHistory();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

function renderProductsTable(productsToRender = products) {
    const tbody = document.querySelector('#productsTable tbody');
    if (!tbody) return;

    if (productsToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>No products found</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = productsToRender.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>
                <span class="stock-badge stock-${product.quantity > 5 ? 'good' : 'low'}">
                    ${product.quantity}
                </span>
            </td>
            <td><span class="status-badge active">Active</span></td>
            <td>
                ${product.quantity > 0 ? `
                    <button class="btn btn-sm btn-success" onclick="makeSale(${product.id}, ${product.price})">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-warning" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
    renderProductsTable(filtered);
}

async function handleProductForm(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);
    
    const productData = { name, price, quantity };
    
    try {
        let response;
        if (editingProductId) {
            response = await fetch(`/api/products/${editingProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }
        
        if (response.ok) {
            showNotification(editingProductId ? 'Product updated successfully!' : 'Product added successfully!', 'success');
            closeModal('addProductModal');
            loadProducts();
        } else {
            throw new Error('Failed to save product');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Failed to save product', 'error');
    }
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        editingProductId = id;
        document.getElementById('productId').value = id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('modalTitle').textContent = 'Edit Product';
        openModal('addProductModal');
    }
}

function resetProductForm() {
    editingProductId = null;
    document.getElementById('productForm').reset();
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productId').value = '';
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Product deleted successfully!', 'success');
            loadProducts();
        } else {
            throw new Error('Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Failed to delete product', 'error');
    }
}

// ===== SALES MANAGEMENT =====
// In app.js, update the makeSale function:
async function makeSale(productId) {
    // Get product details first
    const product = products.find(p => p.id === productId);
    if (!product || product.quantity === 0) {
        showNotification('Product not available or out of stock', 'error');
        return;
    }
    
    const quantity = prompt(`Enter quantity to sell ${product.name} (Stock: ${product.quantity}):`);
    if (!quantity || quantity <= 0 || quantity > product.quantity) {
        showNotification('Invalid quantity', 'error');
        return;
    }
    
    try {
        await fetch(`/api/sales/${productId}/${quantity}`, {  // ✅ Fixed endpoint
            method: 'POST'
        });
        
        showNotification(`✅ Sale completed! ${quantity} x ${product.name} sold.`, 'success');
        loadProducts();
    } catch (error) {
        console.error('Error making sale:', error);
        showNotification('❌ Failed to process sale. Check stock availability.', 'error');
    }
}

async function quickSale() {
    const productId = document.getElementById('quickProductSelect').value;
    const quantity = document.getElementById('quickQuantity').value;
    
    if (!productId || !quantity || quantity <= 0) {
        showNotification('Please select a product and enter valid quantity', 'error');
        return;
    }
    
    try {
        await fetch(`/api/sales/${productId}/${quantity}`, {
         method: 'POST'
        });
        
        showNotification(`Quick sale completed! ${quantity} units sold.`, 'success');
        document.getElementById('quickQuantity').value = '';
        loadProducts();
        loadSalesHistory();
    } catch (error) {
        console.error('Error making quick sale:', error);
        showNotification('Failed to process quick sale', 'error');
    }
}

function loadQuickSaleProducts() {
    const select = document.getElementById('quickProductSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Product</option>' + 
        products
            .filter(p => p.quantity > 0)
            .map(p => 
                `<option value="${p.id}" data-price="${p.price}" data-stock="${p.quantity}">
                    ${p.name} (Stock: ${p.quantity}, $${p.price})
                </option>`
            ).join('');
}

function updateQuickSaleQuantity() {
    const select = document.getElementById('quickProductSelect');
    const quantityInput = document.getElementById('quickQuantity');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption.value) {
        const maxStock = parseInt(selectedOption.dataset.stock);
        quantityInput.max = maxStock;
        quantityInput.placeholder = `Max: ${maxStock}`;
    }
}

async function loadSalesHistory() {
    try {
        const response = await fetch('/api/sales'); // You'll need to add this endpoint
        const sales = await response.json();
        renderSalesTable(sales);
    } catch (error) {
        console.error('Error loading sales:', error);
    }
}

function renderSalesTable(sales) {
    const tbody = document.getElementById('salesTableBody');
    if (!tbody || !sales || sales.length === 0) {
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-shopping-cart"></i>
                        <p>No sales found</p>
                    </td>
                </tr>
            `;
        }
        return;
    }

    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.product?.name || 'N/A'}</td>
            <td>${sale.quantity}</td>
            <td>$${sale.product?.price?.toFixed(2) || '0.00'}</td>
            <td>$${(sale.quantity * (sale.product?.price || 0)).toFixed(2)}</td>
        </tr>
    `).join('');
}

// ===== UTILITY FUNCTIONS =====
function showNotification(message, type = 'success') {
    // Create notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'error'}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        ${message}
    `;
    
    // Add to page
    document.querySelector('.page-content').insertBefore(notification, document.querySelector('.page-content').firstChild);
    
    // Auto remove
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ===== EVENT DELEGATION FOR DYNAMIC ELEMENTS =====
document.addEventListener('click', function(e) {
    // Add product button
    if (e.target.closest('[data-modal]')) {
        const modalId = e.target.closest('[data-modal]').dataset.modal;
        openModal(modalId);
    }
    
    // Restock button (for dashboard)
    if (e.target.closest('[onclick*="restockProduct"]')) {
        const productId = e.target.closest('[onclick*="restockProduct"]').getAttribute('onclick').match(/(\d+)/)[1];
        restockProduct(productId);
    }
});

function restockProduct(productId) {
    const quantity = prompt('Enter quantity to restock:');
    if (quantity && quantity > 0) {
        // This would update the product quantity via API
        showNotification(`Restocked ${quantity} units (implement API call)`, 'success');
    }
}

// ===== AUTO-REFRESH (OPTIONAL) =====
setInterval(() => {
    loadProducts();
}, 30000); // Refresh every 30 seconds