// ===== GLOBAL VARIABLES =====
let products = [];
let editingProductId = null;

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    loadProducts();
    initParticles(); // ✨ NEW: Particle system
    initScrollReveal(); // ✨ NEW: Scroll animations
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
    
    // ✨ NEW: Enhanced interactions
    initEnhancedInteractions();
}

// ===== ENHANCED INTERACTIONS =====
function initEnhancedInteractions() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll('.card, .stat-card, .table-container, .btn').forEach(el => {
        observer.observe(el);
    });
}

// ===== SIDEBAR TOGGLE (ENHANCED) =====
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('collapsed');
    
    // ✨ NEW: Enhanced mobile support
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
    }
    
    // ✨ NEW: Body scroll lock for mobile
    if (sidebar.classList.contains('mobile-open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// ===== PARTICLE SYSTEM ✨
function initParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);
    
    let particleCount = 0;
    const maxParticles = 50;
    
    function createParticle() {
        if (particleCount >= maxParticles) return;
        
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
        particle.style.animationDelay = Math.random() * 2 + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.3;
        particle.style.width = Math.random() * 6 + 3 + 'px';
        particle.style.height = particle.style.width;
        
        particlesContainer.appendChild(particle);
        particleCount++;
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
            particleCount--;
        }, 8000);
    }
    
    // Create particles continuously
    setInterval(createParticle, 400);
    
    // Responsive particle count
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768) {
            maxParticles = 25;
        } else {
            maxParticles = 50;
        }
    });
}

// ===== SCROLL REVEAL ANIMATIONS ✨
function initScrollReveal() {
    // Staggered animations for stats cards
    const statsCards = document.querySelectorAll('.stat-card');
    statsCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// ===== MODAL FUNCTIONS (ENHANCED) =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // ✨ NEW: Focus trap for accessibility
    modal.focus();
    
    // ✨ NEW: Enhanced entrance animation
    setTimeout(() => {
        modal.querySelector('.modal-content').classList.add('animate-in');
    }, 50);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    modal.querySelector('.modal-content')?.classList.remove('animate-in');
    document.body.style.overflow = 'auto';
    resetProductForm();
}

// Close modals when clicking outside or ESC key
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal.id);
        }
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
        updateStats(); // ✨ NEW: Live stats update
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
        <tr class="table-row" data-aos="fade-up">
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
                    <button class="btn btn-sm btn-success" onclick="makeSale(${product.id}, ${product.price})" data-ripple>
                        <i class="fas fa-shopping-cart"></i> Sell
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-warning" onclick="editProduct(${product.id})" data-ripple>
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})" data-ripple>
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // ✨ NEW: Add ripple effect to buttons
    initRippleEffect();
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.id.toString().includes(searchTerm)
    );
    renderProductsTable(filtered);
}

// ===== RIPPLE EFFECT ✨
function initRippleEffect() {
    document.querySelectorAll('[data-ripple]').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
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

// ===== STATS UPDATER ✨
function updateStats() {
    const totalProducts = products.length;
    const lowStock = products.filter(p => p.quantity <= 5).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    // Update stat cards if they exist
    const totalProductsEl = document.querySelector('.stat-card.primary h3');
    const lowStockEl = document.querySelector('.stat-card.warning h3');
    const totalValueEl = document.querySelector('.stat-card.success h3');
    
    if (totalProductsEl) totalProductsEl.textContent = totalProducts;
    if (lowStockEl) lowStockEl.textContent = lowStock;
    if (totalValueEl) totalValueEl.textContent = `$${totalValue.toLocaleString()}`;
}

// ===== SALES MANAGEMENT =====
async function makeSale(productId) {
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
        await fetch(`/api/sales/${productId}/${quantity}`, {
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
        const response = await fetch('/api/sales');
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
        <tr class="table-row" data-aos="fade-up">
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.product?.name || 'N/A'}</td>
            <td>${sale.quantity}</td>
            <td>$${sale.product?.price?.toFixed(2) || '0.00'}</td>
            <td>$${(sale.quantity * (sale.product?.price || 0)).toFixed(2)}</td>
        </tr>
    `).join('');
}

// ===== ENHANCED NOTIFICATION SYSTEM ✨
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'warning'}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    const pageContent = document.querySelector('.page-content');
    pageContent.insertBefore(notification, pageContent.firstChild);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.classList.add('animate-in');
    });
    
    // Auto remove with animation
    setTimeout(() => {
        notification.classList.add('animate-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
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
    
    // Quick sale button
    if (e.target.closest('#quickSaleBtn')) {
        quickSale();
    }
});

function restockProduct(productId) {
    const quantity = prompt('Enter quantity to restock:');
    if (quantity && quantity > 0) {
        showNotification(`Restocked ${quantity} units (implement API call)`, 'success');
        loadProducts();
    }
}

// ===== AUTO-REFRESH WITH THROTTLING ✨
let refreshTimeout;
function scheduleRefresh() {
    clearTimeout(refreshTimeout);
    refreshTimeout = setTimeout(() => {
        loadProducts();
    }, 5000); // Throttled refresh
}

// Replace the old interval with this:
let lastRefresh = 0;
setInterval(() => {
    const now = Date.now();
    if (now - lastRefresh > 30000) { // 30 seconds
        loadProducts();
        lastRefresh = now;
    }
}, 5000);

// ===== PERFORMANCE MONITORING ✨
function monitorPerformance() {
    if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        console.log('Page load time:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
    }
}

// Run on load
monitorPerformance();

// ===== MOBILE MENU SUPPORT ✨
window.addEventListener('resize', function() {
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth > 768) {
        sidebar.classList.remove('mobile-open');
        document.body.style.overflow = 'auto';
    }
});

// Export functions for global access
window.toggleSidebar = toggleSidebar;
window.openModal = openModal;
window.closeModal = closeModal;
window.makeSale = makeSale;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.quickSale = quickSale;
window.restockProduct = restockProduct;